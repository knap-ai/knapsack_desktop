use log::{debug, error};

use dirs::home_dir;
use serde::Serialize;
use serde_json::json;
use std::collections::HashSet;
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU16, Ordering};
use std::sync::Arc;
use std::time::UNIX_EPOCH;
use tauri::api::process::Command;

use crate::api::document::DisplayDocument;
use crate::db::models::{document::Document, local_file::LocalFile};
use crate::error::Error;

use crate::memory::text_splitter::TextSplitter;
use crate::server::status::{KNAPSACK_STATUS_READHOME_MAX, KNAPSACK_STATUS_READHOME_MIN};
use crate::utils::platform::{get_os, OS};

use dotext::*;

const SINGLE_FILE_CONTENT_LIMIT: u64 = 150000000; // Limit in MB
pub const PDF_TO_TEXT_BINARY_NAME: &str = "pdftotext";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalFileResponseDoc {
  #[serde(flatten)]
  pub source_document: DisplayDocument,
  pub file_path: String,
  pub size: u64,
}

lazy_static! {
  static ref FILE_CONTENT_SEARCHABLE_EXTS: HashSet<&'static str> = {
    HashSet::from(["doc", "docx", "pdf", "odp", "ods", "odt", "xlsx", "pptx", "txt", "rtf"])
  };
  static ref FILE_NAME_SEARCHABLE_EXTS: HashSet<&'static str> = {

    // https://www.computerhope.com/issues/ch001789.htm
    HashSet::from([
      // audio
      "aif", "cda", "mid", "midi", "mp3", "mpa", "ogg", "wav", "wma", "wpl",
      // compressed
      "7z", "arj", "deb", "pkg", "rar", "rpm", "tar.gz", "z", "zip",
      // disc
      "bin", "dmg", "iso", "toast", "vcd",
      // data
      "csv", "dat", "db", "dbf", "log", "mdb", "sav", "sql", "tar", "xml",
      // email
      "email", "eml", "emlx", "msg", "oft", "ost", "pst", "vcf",
      // executable
      "bat", "bin", "com", "exe", "gadget", "msi", "sh", "wsf",
      // font
      "fnt", "fon", "otf", "ttf",
      // image
      "ai", "psd",
      // "ai", "bmp", "gif", "ico", "jpeg", "jpg", "png", "ps", "psd", "scr", "svg", "tif", "tiff", "webp",
      // internet
      // "asp", "aspx", "cer", "cfm", "cgi", "pl", "css", "htm", "html", "js", "jsp", "part", "php", "py", "rss", "xhtml",
      // presentations
      "key", "odp", "pps", "ppt", "pptx",
      // programming
      // "apk", "c", "cgi", "pl", "class", "cpp", "cs", "h", "jar", "java", "php", "py", "sh", "swift", "vb",
      // spreadsheets
      "csv", "ods", "xls", "xlsm", "xlsx",
      // system
      // "bak", "cab", "cfg", "cpl", "cur", "dll", "dmp", "drv", "icns", "ico", "ini", "lnk", "msi", "sys", "tmp",
      // video
      "3g2", "3gp", "avi", "flv", "h264", "m4v", "mkv", "mov", "mp4", "mpg", "mpeg", "rm", "swf", "vob", "webm", "wmv",
      // word
      "doc", "docx", "odt", "pdf", "rtf", "tex", "txt", "wpd"
        ])
  };
}

fn is_file_content_searchable_extension(path: &Path) -> bool {
  path
    .extension()
    .and_then(|ext| ext.to_str())
    .map(|ext| FILE_CONTENT_SEARCHABLE_EXTS.contains(&ext.to_lowercase().as_str()))
    .unwrap_or(false)
}

fn is_file_name_searchable_extension(path: &Path) -> bool {
  path
    .extension()
    .and_then(|ext| ext.to_str())
    .map(|ext| FILE_NAME_SEARCHABLE_EXTS.contains(&ext.to_lowercase().as_str()))
    .unwrap_or(false)
}

fn expand_home(path: &Path) -> PathBuf {
  if let Ok(stripped_path) = path.strip_prefix("~") {
    if let Some(home_dir) = home_dir() {
      println!("\n\nNEW PATH AFTER HOME DIR: {:?} \n\n", path);
      return home_dir.join(stripped_path);
    }
  }
  path.to_path_buf()
}

fn remove_repeated_whitespace(input: &str) -> String {
  input.split_whitespace().collect::<Vec<&str>>().join(" ")
}

pub fn read_pdf_contents(path: PathBuf) -> Result<Vec<String>, Box<dyn std::error::Error>> {
  // println!("read_pdf_contents: inside");
  let output = Command::new_sidecar(PDF_TO_TEXT_BINARY_NAME)
    .expect("Failed to execute command.")
    .args(&["-layout", path.to_str().unwrap(), "-"])
    .output()
    .expect("Failed to get pdftotext sidecar output.");
  // println!("read_pdf_contents: after");

  if !output.status.success() {
    error!(
      "pdftotext ERROR: command error {:?}",
      path.to_str().unwrap()
    );
  }
  debug!("Content len: {}", output.stdout.len());

  let trimmed_output = remove_repeated_whitespace(&output.stdout);

  let pdf_text = String::from_utf8_lossy(trimmed_output.as_bytes()).to_string();

  let splitter = TextSplitter::default();
  Ok(splitter.split_text(&pdf_text))
}

pub fn read_contents(content_path: &Path) -> Result<Vec<String>, Box<dyn std::error::Error>> {
  let path: PathBuf = expand_home(&content_path);
  // println!("read_contents: reading file: {:?}", path);

  // let text_splitter = TextSplitter::default();
  // let text_chunker = TextChunker::new().max_chunk_token_size(150);
  // let config = ChunkConfig::new(600).with_overlap(50).unwrap().with_trim(true);
  // let splitter = TextSplitter::new(config);
  let splitter = TextSplitter::default();
  if let Some(extension) = path.extension().and_then(|ext| ext.to_str()) {
    match extension.to_lowercase().as_str() {
      "pdf" => {
        // println!("read_contents: reading pdf: {:?}", path);
        read_pdf_contents(path)
      }
      "docx" | "doc" | "odp" | "ods" | "odt" => {
        if let Ok(mut file) = Docx::open(path) {
          let mut text = String::new();
          let _ = file.read_to_string(&mut text);
          Ok(splitter.split_text(&text))
        } else {
          Err("Error opening document.".into())
        }
      }
      "xlsx" => {
        if let Ok(mut file) = Xlsx::open(path) {
          let mut text = String::new();
          let _ = file.read_to_string(&mut text);
          Ok(splitter.split_text(&text))
        } else {
          Err("Error opening spreadsheet.".into())
        }
      }
      "pptx" => {
        if let Ok(mut file) = Pptx::open(path) {
          let mut text = String::new();
          let _ = file.read_to_string(&mut text);
          Ok(splitter.split_text(&text))
        } else {
          Err("Error opening powerpoint.".into())
        }
      }
      "txt" | "rtf" => {
        if let Ok(text) = fs::read_to_string(path) {
          Ok(splitter.split_text(&text))
        } else {
          Err("Error opening text file.".into())
        }
      }
      _ => return Err("Unsupported file extension".into()),
    }
  } else {
    return Err("File has no extension".into());
  }
}

pub fn read_file_contents(
  local_file: &LocalFile,
) -> Result<Vec<String>, Box<dyn std::error::Error>> {
  let path = Path::new(&local_file.path);

  if !is_file_content_searchable_extension(path) {
    let e = format!("File ext is not readable: {}", local_file.path);
    return Err(e.into());
  } else if local_file.file_size > SINGLE_FILE_CONTENT_LIMIT {
    let e = format!(
      "File > SINGLE_FILE_CONTENT_LIMIT - not reading: {}",
      local_file.path
    );
    return Err(e.into());
  } else {
    debug!("read_file_contents: reading file: {:?}", path);
    read_contents(Path::new(&local_file.path))
  }
}

#[tauri::command]
pub fn kn_open_file_as_app(path: String) -> Result<String, String> {
  debug!("kn_open_file_as_app: Opening file: {}", path);
  let path_obj = Path::new(&path);
  if path_obj.exists() {
    if let Err(err) = open::that(path.clone()) {
      return Err(format!("Failed to open file: {}: {}", path, err));
    }
    Ok(format!(
      "kn_open_file_as_app: File opened success: {}",
      path.clone()
    ))
  } else {
    Err(format!(
      "kn_open_file_as_app: File does not exist: {}",
      path
    ))
  }
}

#[tauri::command]
pub fn kn_trigger_file_read_permissions() -> serde_json::Value {
  let home_dir = match dirs::home_dir() {
    Some(dir) => dir,
    None => return json!({ "success": false, "error": "Could not find home directory" }),
  };

  let mut directories = Vec::new();
  if get_os() == OS::WINDOWS {
    directories.extend(["OneDrive/Documents", "Downloads", "OneDrive/Desktop"]);
  } else if get_os() == OS::MACOS {
    directories.extend(["Documents", "Downloads", "Desktop"]);
  }

  let mut results = serde_json::Map::new();

  for directory in &directories {
    let mut dir_path = PathBuf::from(&home_dir);
    dir_path.push(directory);

    let can_read = fs::read_dir(&dir_path).is_ok();
    results.insert(directory.to_string(), json!(can_read));
  }

  json!({ "success": true, "permissions": results })
}

#[tauri::command]
pub fn read_home_dir(
  knapsack_search_indexing_progress: &Arc<AtomicU16>,
) -> Result<Vec<LocalFile>, String> {
  let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
  debug!("Message from Rust: {}", home_dir.display());

  let mut file_infos: Vec<LocalFile> = Vec::new();

  let mut desktop_dir = PathBuf::from(&home_dir);
  let mut documents_dir = PathBuf::from(&home_dir);
  let mut downloads_dir = PathBuf::from(&home_dir);
  let desktop = "Desktop";
  let documents = "Documents";
  let downloads = "Downloads";

  desktop_dir.push(desktop);
  documents_dir.push(documents);
  downloads_dir.push(downloads);

  knapsack_search_indexing_progress.store(
    (KNAPSACK_STATUS_READHOME_MIN * 100.0) as u16,
    Ordering::SeqCst,
  );

  if let Err(e) = visit_dirs(
    &desktop_dir,
    &mut file_infos,
    &knapsack_search_indexing_progress,
  ) {
    log::debug!(
      "Message from Rust: {}",
      format!("Error reading directories: {:?}", e)
    );
    return Err(format!("Error reading directories: {:?}", e));
  }
  knapsack_search_indexing_progress.store(
    ((KNAPSACK_STATUS_READHOME_MAX - KNAPSACK_STATUS_READHOME_MIN) * (1.0 / 3.0) * 100.0) as u16,
    Ordering::SeqCst,
  );

  if let Err(e) = visit_dirs(
    &downloads_dir,
    &mut file_infos,
    &knapsack_search_indexing_progress,
  ) {
    log::debug!(
      "Message from Rust: {}",
      format!("Error reading directories: {:?}", e)
    );
    return Err(format!("Error reading directories: {:?}", e));
  }
  knapsack_search_indexing_progress.store(
    ((KNAPSACK_STATUS_READHOME_MAX - KNAPSACK_STATUS_READHOME_MIN) * (2.0 / 3.0) * 100.0) as u16,
    Ordering::SeqCst,
  );

  if let Err(e) = visit_dirs(
    &documents_dir,
    &mut file_infos,
    &knapsack_search_indexing_progress,
  ) {
    log::debug!(
      "Message from Rust: {}",
      format!("Error reading directories: {:?}", e)
    );
    return Err(format!("Error reading directories: {:?}", e));
  }
  knapsack_search_indexing_progress.store(
    ((KNAPSACK_STATUS_READHOME_MAX - KNAPSACK_STATUS_READHOME_MIN) * (3.0 / 3.0) * 100.0) as u16,
    Ordering::SeqCst,
  );

  file_infos.sort_by_key(|fi| fi.date_modified);
  debug!("Number Of paths: {}", file_infos.len());

  // TODO: do this in separate thread.
  // file_upload::upload_and_process_files(paths.clone());

  knapsack_search_indexing_progress.store(
    (KNAPSACK_STATUS_READHOME_MAX * 100.0) as u16,
    Ordering::SeqCst,
  );

  Ok(file_infos)
}

fn visit_dirs(
  dir: &Path,
  file_infos: &mut Vec<LocalFile>,
  knapsack_search_indexing_progress: &Arc<AtomicU16>,
) -> Result<(), Error> {
  if dir.is_dir() {
    for entry in fs::read_dir(dir)? {
      let entry = entry?;
      let path = entry.path();
      if is_hidden(&path) {
        continue;
      }

      if path.is_dir() {
        visit_dirs(&path, file_infos, &knapsack_search_indexing_progress)?;
      } else if is_file_name_searchable_extension(&path)
        || is_file_content_searchable_extension(&path)
      {
        let file_size = get_file_size(&path)?;
        let (date_modified, date_created) = get_file_times(&path)?;
        // TODO: Currently, can't insert yet because we don't have title.
        file_infos.push(LocalFile {
          id: None,
          filename: path.file_name().unwrap().to_string_lossy().into_owned(),
          path: path.to_string_lossy().into_owned(),
          file_size,
          date_modified,
          date_created,
          title: "".to_string(),
          summary: None,
          checksum: None,
          timestamp: None,
        });
      }
    }
  }
  Ok(())
}

fn get_file_size(path: &PathBuf) -> Result<u64, Error> {
  let metadata = fs::metadata(path)?;
  Ok(metadata.len())
}

fn get_file_times(path: &PathBuf) -> Result<(u64, Option<u64>), Error> {
  let metadata = fs::metadata(path)?;
  let modified = metadata.modified()?;
  let created = metadata.created().ok(); // Not all platforms support created time
  if created.is_none() {
    Ok((modified.duration_since(UNIX_EPOCH)?.as_secs(), None))
  } else {
    Ok((
      modified.duration_since(UNIX_EPOCH)?.as_secs(),
      Some(created.unwrap().duration_since(UNIX_EPOCH)?.as_secs()),
    ))
  }
}

fn is_hidden(path: &Path) -> bool {
  path
    .file_name()
    .and_then(|name| name.to_str())
    .map(|name| name.starts_with('.'))
    .unwrap_or(false)
}

pub fn get_local_files_from_dir(dir_path: String) -> Result<Vec<LocalFile>, String> {
  let mut file_infos: Vec<LocalFile> = Vec::new();

  let dir = PathBuf::from(&dir_path);

  if let Err(e) = visit_dirs(&dir, &mut file_infos, &Arc::new(AtomicU16::new(0))) {
    log::debug!(
      "Message from Rust: {}",
      format!("Error reading directories: {:?}", e)
    );
    return Err(format!("Error reading directories: {:?}", e));
  }

  file_infos.sort_by_key(|fi| fi.date_modified);
  debug!("Number Of paths: {}", file_infos.len());

  Ok(file_infos)
}

pub fn convert_pathbuf_to_local_file(pathbuf: &PathBuf) -> Result<LocalFile, Error> {
  let file_size = get_file_size(&pathbuf)?;
  let (date_modified, date_created) = get_file_times(&pathbuf)?;
  let file_name = pathbuf.file_name().unwrap().to_string_lossy().into_owned();
  let local_file = LocalFile::find_by_filename(file_name.clone())?;
  if local_file.is_some() {
    return Ok(local_file.unwrap());
  }
  let mut local_file = LocalFile {
    id: None,
    filename: file_name.clone(),
    path: pathbuf.to_string_lossy().into_owned(),
    file_size,
    date_modified,
    date_created,
    title: file_name.clone(),
    summary: None,
    checksum: None,
    timestamp: None,
  };
  local_file.upsert()?;
  Ok(local_file)
}

pub fn get_docs_for_finra_compliance(path: &PathBuf) -> Vec<LocalFileResponseDoc> {
  let mut docs = Vec::new();
  let path_str = path
    .clone()
    .into_os_string()
    .into_string()
    .expect("Error converting path to string");
  if path.is_dir() {
    docs = get_local_files_from_dir(path_str).expect("Error getting local files");
  } else {
    let local_file =
      convert_pathbuf_to_local_file(&path.clone()).expect("Error converting pathbuf to local file");
    docs.push(local_file);
  }

  let mut res = Vec::new();
  for local_file in docs {
    if local_file.id.is_some() {
      let document_id: u64 =
        match Document::find_by_foreign_table_and_id("local_files", local_file.id.unwrap()) {
          Ok(Some(doc)) => doc.id.unwrap(),
          Ok(None) => continue,
          Err(_) => continue,
        };
      let display_document = DisplayDocument {
        document_id,
        title: local_file.title,
        document_type: "file".to_string(),
        summary: None,
        uri: local_file.path.clone(),
      };
      res.push(LocalFileResponseDoc {
        source_document: display_document,
        file_path: local_file.path.clone(),
        size: local_file.file_size,
      });
    }
  }
  return res;
}

pub fn get_filename_from_path(path_str: String) -> Option<String> {
  let path = PathBuf::from(path_str);
  path.file_name()?.to_str().map(|s| s.to_string())
}
