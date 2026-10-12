use crate::{Entry, Error, Limits, Result};
use std::path::Path;

#[cfg(not(unix))]
pub(crate) fn read_tree(_: &Path, _: Limits) -> Result<Vec<Entry>> {
  Err(Error::UnsupportedPlatform)
}
#[cfg(not(unix))]
pub(crate) fn publish_new(_: &[Entry], _: &Path) -> Result<bool> {
  Err(Error::UnsupportedPlatform)
}

#[cfg(unix)]
mod unix {
  use super::*;
  use crate::{blocked_component, digest, portable_component, validate_path, STRUCTURED_FILES};
  use std::{
    ffi::{CStr, CString, OsStr, OsString},
    fs::File,
    io::{Read, Write},
    os::{
      fd::{AsRawFd, FromRawFd, RawFd},
      unix::{
        ffi::{OsStrExt, OsStringExt},
        fs::MetadataExt,
      },
    },
    path::{Component, PathBuf},
  };

  fn cstring(value: &OsStr) -> Result<CString> {
    CString::new(value.as_bytes()).map_err(|_| Error::InvalidPath)
  }
  fn io(message: &'static str) -> Error {
    Error::Io(message)
  }
  fn open_child(parent: RawFd, name: &OsStr, directory: bool) -> Result<File> {
    let name = cstring(name)?;
    let mut flags = libc::O_RDONLY | libc::O_NOFOLLOW | libc::O_CLOEXEC | libc::O_NONBLOCK;
    if directory {
      flags |= libc::O_DIRECTORY;
    }
    // O_NOFOLLOW applies at every path component, because name is a single
    // readdir component and ancestors are already pinned open descriptors.
    let fd = unsafe { libc::openat(parent, name.as_ptr(), flags) };
    if fd < 0 {
      let error = std::io::Error::last_os_error();
      return Err(
        if matches!(error.raw_os_error(), Some(libc::ELOOP | libc::ENOTDIR)) {
          Error::UnsupportedEntry
        } else {
          io("Cannot open authoritative state safely")
        },
      );
    }
    Ok(unsafe { File::from_raw_fd(fd) })
  }
  fn secure_directory(path: &Path) -> Result<File> {
    let path = if path.is_absolute() {
      path.to_owned()
    } else {
      std::env::current_dir()
        .map_err(|_| io("Cannot resolve current directory"))?
        .join(path)
    };
    let mut directory = File::open("/").map_err(|_| io("Cannot open filesystem root"))?;
    for part in path.components() {
      match part {
        Component::RootDir => {}
        Component::Normal(name) => {
          directory = open_child(directory.as_raw_fd(), name, true)?;
        }
        _ => return Err(Error::InvalidPath),
      }
    }
    Ok(directory)
  }
  fn names(directory: &File, limit: usize) -> Result<Vec<OsString>> {
    // Duplicate the descriptor so closedir cannot close our caller's handle.
    // fdopendir shares its directory offset, so reopen '.' to get a fresh one.
    let fresh = open_child(directory.as_raw_fd(), OsStr::new("."), true)?;
    let duplicate = unsafe { libc::dup(fresh.as_raw_fd()) };
    if duplicate < 0 {
      return Err(io("Cannot enumerate authoritative state"));
    }
    let dir = unsafe { libc::fdopendir(duplicate) };
    if dir.is_null() {
      unsafe {
        libc::close(duplicate);
      }
      return Err(io("Cannot enumerate authoritative state"));
    }
    struct Dir(*mut libc::DIR);
    impl Drop for Dir {
      fn drop(&mut self) {
        unsafe {
          libc::closedir(self.0);
        }
      }
    }
    let dir = Dir(dir);
    let mut result = Vec::new();
    loop {
      // readdir reports EOF and errors as null. Clear errno first.
      set_errno_zero();
      let row = unsafe { libc::readdir(dir.0) };
      if row.is_null() {
        if std::io::Error::last_os_error().raw_os_error().unwrap_or(0) != 0 {
          return Err(io("Cannot enumerate authoritative state"));
        }
        break;
      }
      let bytes = unsafe { CStr::from_ptr((*row).d_name.as_ptr()) }.to_bytes();
      if bytes == b"." || bytes == b".." {
        continue;
      }
      if result.len() >= limit {
        return Err(Error::Bounds);
      }
      result.push(OsString::from_vec(bytes.to_vec()));
    }
    result.sort();
    Ok(result)
  }
  #[cfg(target_os = "linux")]
  fn set_errno_zero() {
    unsafe {
      *libc::__errno_location() = 0;
    }
  }
  #[cfg(any(target_os = "macos", target_os = "ios", target_os = "freebsd"))]
  fn set_errno_zero() {
    unsafe {
      *libc::__error() = 0;
    }
  }
  #[cfg(not(any(
    target_os = "linux",
    target_os = "macos",
    target_os = "ios",
    target_os = "freebsd"
  )))]
  fn set_errno_zero() {}

  // Inspect entry without opening FIFOs/devices; do not follow symlinks.
  fn stat_child(parent: RawFd, name: &OsStr) -> Result<libc::stat> {
    let name = cstring(name)?;
    let mut stat = std::mem::MaybeUninit::<libc::stat>::uninit();
    if unsafe {
      libc::fstatat(
        parent,
        name.as_ptr(),
        stat.as_mut_ptr(),
        libc::AT_SYMLINK_NOFOLLOW,
      )
    } != 0
    {
      return Err(io("Authoritative state changed during enumeration"));
    }
    Ok(unsafe { stat.assume_init() })
  }
  fn same_metadata(a: &std::fs::Metadata, b: &std::fs::Metadata) -> bool {
    a.dev() == b.dev()
      && a.ino() == b.ino()
      && a.len() == b.len()
      && a.mtime() == b.mtime()
      && a.mtime_nsec() == b.mtime_nsec()
      && a.ctime() == b.ctime()
      && a.ctime_nsec() == b.ctime_nsec()
      && a.mode() == b.mode()
  }
  struct Scan {
    files: Vec<Entry>,
    bytes: usize,
    seen: usize,
    limits: Limits,
  }
  fn walk(dir: &File, prefix: &str, scan: &mut Scan) -> Result<()> {
    let before = dir
      .metadata()
      .map_err(|_| io("Cannot inspect state directory"))?;
    for name in names(dir, scan.limits.max_files.saturating_mul(20).max(100))? {
      scan.seen = scan.seen.checked_add(1).ok_or(Error::Bounds)?;
      if scan.seen > scan.limits.max_files.saturating_mul(20).max(100) {
        return Err(Error::Bounds);
      }
      let stat = stat_child(dir.as_raw_fd(), &name)?;
      let kind = stat.st_mode & libc::S_IFMT;
      if kind != libc::S_IFREG && kind != libc::S_IFDIR {
        return Err(Error::UnsupportedEntry);
      }
      let text = name.to_str().ok_or(Error::InvalidPath)?;
      let relative = if prefix.is_empty() {
        text.to_owned()
      } else {
        format!("{prefix}/{text}")
      };
      if kind == libc::S_IFDIR {
        if prefix == ".knapsack" {
          continue;
        }
        if relative == ".knapsack" {
          let child = open_child(dir.as_raw_fd(), &name, true)?;
          walk(&child, &relative, scan)?;
          continue;
        }
        if text.starts_with('.') || blocked_component(text) {
          continue;
        }
        if !portable_component(text)
          || relative.len() > 1024
          || relative.split('/').count() >= scan.limits.max_depth
        {
          return Err(Error::InvalidPath);
        }
        let child = open_child(dir.as_raw_fd(), &name, true)?;
        walk(&child, &relative, scan)?;
      } else {
        if prefix == ".knapsack" {
          if !STRUCTURED_FILES.contains(&relative.as_str()) {
            if ["loops-v", "follow-through-v", "goals-v"]
              .iter()
              .any(|p| text.starts_with(p))
              && text.ends_with(".json")
            {
              return Err(Error::UnsupportedVersion);
            }
            continue;
          }
        } else if text.starts_with('.') || !text.ends_with(".md") {
          continue;
        }
        validate_path(&relative, scan.limits.max_depth)?;
        if scan.files.len() >= scan.limits.max_files {
          return Err(Error::Bounds);
        }
        if stat.st_mode & 0o111 != 0 {
          return Err(Error::UnsupportedEntry);
        }
        let mut file = open_child(dir.as_raw_fd(), &name, false)?;
        let first = file
          .metadata()
          .map_err(|_| io("Cannot inspect state file"))?;
        if !first.is_file() || first.mode() & 0o111 != 0 || first.nlink() > 1 {
          return Err(Error::UnsupportedEntry);
        }
        if first.len() > scan.limits.max_file_bytes as u64 {
          return Err(Error::Bounds);
        }
        if first.dev() != stat.st_dev as u64 || first.ino() != stat.st_ino as u64 {
          return Err(Error::UnstableSnapshot);
        }
        let mut bytes = zeroize::Zeroizing::new(Vec::new());
        (&mut file)
          .take(scan.limits.max_file_bytes as u64 + 1)
          .read_to_end(&mut bytes)
          .map_err(|_| io("Cannot read state file"))?;
        if bytes.len() > scan.limits.max_file_bytes {
          return Err(Error::Bounds);
        }
        let after = file
          .metadata()
          .map_err(|_| io("Cannot inspect state file"))?;
        if !same_metadata(&first, &after) || bytes.len() as u64 != first.len() {
          return Err(Error::UnstableSnapshot);
        }
        scan.bytes = scan.bytes.checked_add(bytes.len()).ok_or(Error::Bounds)?;
        if scan.bytes > scan.limits.max_total_bytes {
          return Err(Error::Bounds);
        }
        let content = std::str::from_utf8(&bytes)
          .map_err(|_| Error::InvalidArchive)?
          .to_owned();
        scan.files.push(Entry {
          path: relative,
          bytes: content.len(),
          sha256: digest(content.as_bytes()),
          content,
        });
      }
    }
    let after = dir
      .metadata()
      .map_err(|_| io("Cannot inspect state directory"))?;
    if !same_metadata(&before, &after) {
      return Err(Error::UnstableSnapshot);
    }
    Ok(())
  }
  pub(crate) fn read_tree(root: &Path, limits: Limits) -> Result<Vec<Entry>> {
    let directory = secure_directory(root)?;
    let mut scan = Scan {
      files: Vec::new(),
      bytes: 0,
      seen: 0,
      limits,
    };
    walk(&directory, "", &mut scan)?;
    scan.files.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(scan.files)
  }
  fn mkdir_at(parent: RawFd, name: &OsStr) -> Result<File> {
    let c = cstring(name)?;
    if unsafe { libc::mkdirat(parent, c.as_ptr(), 0o700) } != 0 {
      return Err(io("Cannot create private restore staging directory"));
    }
    open_child(parent, name, true)
  }
  fn exists(parent: RawFd, name: &OsStr) -> Result<bool> {
    let c = cstring(name)?;
    let mut stat = std::mem::MaybeUninit::<libc::stat>::uninit();
    if unsafe {
      libc::fstatat(
        parent,
        c.as_ptr(),
        stat.as_mut_ptr(),
        libc::AT_SYMLINK_NOFOLLOW,
      )
    } == 0
    {
      return Ok(true);
    }
    if std::io::Error::last_os_error().raw_os_error() == Some(libc::ENOENT) {
      Ok(false)
    } else {
      Err(io("Cannot inspect restore destination"))
    }
  }
  fn write_entry(stage: &File, entry: &Entry) -> Result<()> {
    let mut parent = stage
      .try_clone()
      .map_err(|_| io("Cannot access staging directory"))?;
    let parts: Vec<_> = entry.path.split('/').collect();
    for part in &parts[..parts.len() - 1] {
      parent = if exists(parent.as_raw_fd(), OsStr::new(part))? {
        open_child(parent.as_raw_fd(), OsStr::new(part), true)?
      } else {
        mkdir_at(parent.as_raw_fd(), OsStr::new(part))?
      };
    }
    let name =
      CString::new(*parts.last().ok_or(Error::InvalidPath)?).map_err(|_| Error::InvalidPath)?;
    let fd = unsafe {
      libc::openat(
        parent.as_raw_fd(),
        name.as_ptr(),
        libc::O_WRONLY | libc::O_CREAT | libc::O_EXCL | libc::O_CLOEXEC | libc::O_NOFOLLOW,
        0o600,
      )
    };
    if fd < 0 {
      return Err(io("Cannot create staged state file"));
    }
    let mut file = unsafe { File::from_raw_fd(fd) };
    file
      .write_all(entry.content.as_bytes())
      .map_err(|_| io("Cannot write staged state file"))?;
    file
      .sync_all()
      .map_err(|_| io("Cannot sync staged state file"))?;
    Ok(())
  }
  fn sync_tree(dir: &File) -> Result<()> {
    for name in names(dir, 200_000)? {
      let stat = stat_child(dir.as_raw_fd(), &name)?;
      if stat.st_mode & libc::S_IFMT == libc::S_IFDIR {
        sync_tree(&open_child(dir.as_raw_fd(), &name, true)?)?;
      }
    }
    dir
      .sync_all()
      .map_err(|_| io("Cannot sync staged directory"))
  }
  fn clear_tree(dir: &File) {
    if let Ok(entries) = names(dir, 200_000) {
      for name in entries {
        if let (Ok(stat), Ok(c)) = (stat_child(dir.as_raw_fd(), &name), cstring(&name)) {
          let directory = stat.st_mode & libc::S_IFMT == libc::S_IFDIR;
          if directory {
            if let Ok(child) = open_child(dir.as_raw_fd(), &name, true) {
              clear_tree(&child);
            }
          }
          unsafe {
            libc::unlinkat(
              dir.as_raw_fd(),
              c.as_ptr(),
              if directory { libc::AT_REMOVEDIR } else { 0 },
            );
          }
        }
      }
    }
  }
  struct Stage {
    parent: File,
    name: OsString,
    dir: File,
    published: bool,
  }
  impl Drop for Stage {
    fn drop(&mut self) {
      if self.published {
        return;
      }
      clear_tree(&self.dir);
      // Never unlink a different directory substituted at our staging name.
      if let (Ok(named), Ok(own), Ok(c)) = (
        stat_child(self.parent.as_raw_fd(), &self.name),
        self.dir.metadata(),
        cstring(&self.name),
      ) {
        if named.st_dev as u64 == own.dev() && named.st_ino as u64 == own.ino() {
          unsafe {
            libc::unlinkat(self.parent.as_raw_fd(), c.as_ptr(), libc::AT_REMOVEDIR);
          }
        }
      }
    }
  }
  fn rename_no_replace(parent: RawFd, source: &OsStr, destination: &OsStr) -> Result<()> {
    let source = cstring(source)?;
    let destination = cstring(destination)?;
    #[cfg(target_os = "linux")]
    let result = unsafe {
      libc::syscall(
        libc::SYS_renameat2,
        parent,
        source.as_ptr(),
        parent,
        destination.as_ptr(),
        libc::RENAME_NOREPLACE,
      )
    };
    #[cfg(target_os = "macos")]
    let result = unsafe {
      libc::renameatx_np(
        parent,
        source.as_ptr(),
        parent,
        destination.as_ptr(),
        libc::RENAME_EXCL,
      )
    } as libc::c_long;
    #[cfg(not(any(target_os = "linux", target_os = "macos")))]
    let result: libc::c_long = {
      let _ = (parent, source, destination);
      return Err(Error::UnsupportedPlatform);
    };
    if result == 0 {
      return Ok(());
    }
    let errno = std::io::Error::last_os_error().raw_os_error();
    Err(match errno {
      Some(libc::EEXIST | libc::ENOTEMPTY) => Error::DestinationExists,
      Some(libc::ENOSYS | libc::EINVAL | libc::ENOTSUP) => Error::UnsupportedPlatform,
      _ => io("Cannot atomically publish restored state"),
    })
  }
  pub(crate) fn publish_new(entries: &[Entry], destination: &Path) -> Result<bool> {
    let name = destination
      .file_name()
      .filter(|s| !s.is_empty())
      .ok_or(Error::InvalidPath)?;
    if destination
      .components()
      .any(|c| matches!(c, Component::ParentDir | Component::CurDir))
    {
      return Err(Error::InvalidPath);
    }
    let parent_path: PathBuf = destination
      .parent()
      .filter(|p| !p.as_os_str().is_empty())
      .unwrap_or(Path::new("."))
      .to_owned();
    let parent = secure_directory(&parent_path)?;
    if exists(parent.as_raw_fd(), name)? {
      return Err(Error::DestinationExists);
    }
    let mut nonce = [0u8; 16];
    getrandom::getrandom(&mut nonce).map_err(|_| io("Secure randomness unavailable"))?;
    let stage_name = OsString::from(format!(".knapsack-restore-{}", hex::encode(nonce)));
    let dir = mkdir_at(parent.as_raw_fd(), &stage_name)?;
    let mut stage = Stage {
      parent,
      name: stage_name,
      dir,
      published: false,
    };
    for entry in entries {
      write_entry(&stage.dir, entry)?;
    }
    sync_tree(&stage.dir)?;
    // Sync the staging name as well; all data is durable before publication.
    stage
      .parent
      .sync_all()
      .map_err(|_| io("Cannot sync restore parent directory"))?;
    rename_no_replace(stage.parent.as_raw_fd(), &stage.name, name)?;
    stage.published = true;
    Ok(stage.parent.sync_all().is_ok())
  }
  #[cfg(test)]
  #[test]
  fn no_replace_rename_rejects_destination_created_after_preflight() {
    let temp = tempfile::tempdir().unwrap();
    let root = temp.path().canonicalize().unwrap();
    let parent = secure_directory(&root).unwrap();
    let source = mkdir_at(parent.as_raw_fd(), OsStr::new("staging")).unwrap();
    assert!(!exists(parent.as_raw_fd(), OsStr::new("destination")).unwrap());
    let _racing = mkdir_at(parent.as_raw_fd(), OsStr::new("destination")).unwrap();
    assert_eq!(
      rename_no_replace(
        parent.as_raw_fd(),
        OsStr::new("staging"),
        OsStr::new("destination")
      ),
      Err(Error::DestinationExists)
    );
    assert!(root.join("staging").exists());
    assert!(root.join("destination").exists());
    assert!(source.metadata().unwrap().is_dir());
  }
}
#[cfg(unix)]
pub(crate) use unix::{publish_new, read_tree};

#[cfg(all(test, unix))]
mod tests {
  use super::*;
  #[test]
  fn stage_is_removed_when_writing_fails_midway() {
    let dir = tempfile::tempdir().unwrap();
    let root = dir.path().canonicalize().unwrap();
    // Duplicate filenames simulate an O_EXCL failure after the first successful
    // write. Public restore preflight also rejects this invalid manifest.
    let source = vec![
      super::super::tests::entry("a.md", "one"),
      super::super::tests::entry("a.md", "two"),
    ];
    assert!(publish_new(&source, &root.join("new")).is_err());
    assert!(!root.join("new").exists());
    assert_eq!(std::fs::read_dir(&root).unwrap().count(), 0);
  }
}
