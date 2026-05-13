//! PTY-backed terminal sessions.
//!
//! On macOS/Linux the module uses POSIX `openpty` + `fork` to allocate a real
//! pseudo-terminal, giving interactive programs (SSH, editors) full TTY
//! semantics.  On Windows the module uses the ConPTY API (Windows 10 1809+).
//!
//! Each session is identified by a `session_id` string.  Output from the PTY
//! is streamed to the frontend via the Tauri event `pty-output` and session
//! termination is signalled with `pty-exit`.

use log::info;
use serde_json::json;
use std::collections::{HashMap, VecDeque};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager, State};

/// Max lines kept per session in the output ring buffer.
const OUTPUT_BUFFER_MAX_LINES: usize = 500;

use once_cell::sync::Lazy;
use regex::Regex;

/// Strip ANSI escape sequences and terminal control codes from a string.
/// Used before storing output in the ring buffer so the chat AI gets clean text.
fn strip_ansi(text: &str) -> String {
  // Lazily compiled regex for all common terminal escape sequences
  static RE: Lazy<Regex> = Lazy::new(|| {
    Regex::new(concat!(
      r"\x1B\[[0-9;?]*[A-Za-z]",        // CSI sequences (colors, cursor, erase)
      r"|\x1B\][^\x07\x1B]*(?:\x07|\x1B\\)", // OSC sequences
      r"|\x1B[()#][A-Za-z0-9]",          // Charset selection
      r"|\x1B[78>=]",                     // Cursor save/restore, keypad mode
      r"|\x1B[P_^][^\x1B]*\x1B\\",       // DCS/PM/APC sequences
      r"|\x1B[A-Za-z]",                   // Remaining 2-byte ESC sequences
      r"|\x9B[0-9;?]*[A-Za-z]",          // 8-bit CSI (rare)
      r"|[\x00-\x08\x0E-\x1F\x7F]",     // Control chars (except \t \n \r)
    )).unwrap()
  });
  RE.replace_all(text, "").to_string()
}

/// Global terminal output buffer accessible from the HTTP server (actix-web).
/// This mirrors the Tauri-managed TerminalOutputBuffer but is accessible without Tauri state.
pub static GLOBAL_TERMINAL_BUFFER: Lazy<Arc<Mutex<HashMap<String, VecDeque<String>>>>> =
  Lazy::new(|| Arc::new(Mutex::new(HashMap::new())));

/// Read recent terminal output for use by the chat agent.
/// Returns the last `max_lines` lines for the given session (or all sessions).
pub fn read_terminal_output(session_id: Option<&str>, max_lines: usize) -> HashMap<String, Vec<String>> {
  let limit = max_lines.min(OUTPUT_BUFFER_MAX_LINES);
  let buffers = GLOBAL_TERMINAL_BUFFER.lock().unwrap();
  let mut result = HashMap::new();
  match session_id {
    Some(sid) => {
      if let Some(buf) = buffers.get(sid) {
        let start = if buf.len() > limit { buf.len() - limit } else { 0 };
        result.insert(sid.to_string(), buf.iter().skip(start).cloned().collect());
      }
    }
    None => {
      for (sid, buf) in buffers.iter() {
        let start = if buf.len() > limit { buf.len() - limit } else { 0 };
        result.insert(sid.clone(), buf.iter().skip(start).cloned().collect());
      }
    }
  }
  result
}

/// Push a line to the global terminal buffer (for non-PTY command output).
/// ANSI escape sequences are stripped so the chat AI gets clean text.
pub fn push_terminal_line(session_id: &str, line: &str) {
  if let Ok(mut buffers) = GLOBAL_TERMINAL_BUFFER.lock() {
    let ring = buffers.entry(session_id.to_string()).or_insert_with(VecDeque::new);
    let clean = strip_ansi(line);
    // Skip empty lines that were entirely escape sequences
    if clean.trim().is_empty() && !line.trim().is_empty() {
      return;
    }
    ring.push_back(clean);
    if ring.len() > OUTPUT_BUFFER_MAX_LINES {
      ring.pop_front();
    }
  }
}

// ── Shared session state managed by Tauri ──────────────────────────────

/// Ring buffer that accumulates terminal output lines for each session.
/// This allows the chat AI to read recent terminal output without requiring
/// the user to copy-paste.
pub struct TerminalOutputBuffer {
  pub buffers: Arc<Mutex<HashMap<String, VecDeque<String>>>>,
}

pub struct PtySessionState {
  pub sessions: Arc<Mutex<HashMap<String, PtyHandle>>>,
}

/// Opaque handle kept for each live PTY session.
pub struct PtyHandle {
  alive: Arc<AtomicBool>,

  #[cfg(unix)]
  master_fd: i32,
  #[cfg(unix)]
  child_pid: i32,

  #[cfg(windows)]
  write_handle: *mut std::ffi::c_void,
  #[cfg(windows)]
  process_handle: *mut std::ffi::c_void,
  #[cfg(windows)]
  hpc: isize,
}

// PtyHandle contains raw pointers/fds that are not automatically Send, but
// we only access them behind a Mutex so this is safe.
unsafe impl Send for PtyHandle {}
unsafe impl Sync for PtyHandle {}

/// Wrapper around a raw `*mut c_void` handle so it can be moved into a
/// `std::thread::spawn` closure.  The wrapped handles are Windows kernel
/// objects (pipes, processes) which are safe to use from any thread.
#[cfg(windows)]
struct SendHandle(*mut std::ffi::c_void);

#[cfg(windows)]
unsafe impl Send for SendHandle {}

// ── Tauri commands ─────────────────────────────────────────────────────

/// Spawn a new PTY session and start streaming its output.
#[tauri::command]
pub async fn kn_pty_spawn(
  app: AppHandle,
  session_id: String,
  cwd: Option<String>,
  cols: Option<u16>,
  rows: Option<u16>,
  state: State<'_, PtySessionState>,
) -> Result<(), String> {
  let cols = cols.unwrap_or(80);
  let rows = rows.unwrap_or(24);

  info!(
    "[pty] spawn session={} cols={} rows={} cwd={}",
    session_id, cols, rows, cwd.as_deref().unwrap_or("<default>")
  );

  let handle = platform_spawn(&app, &session_id, cwd.as_deref(), cols, rows)?;

  state
    .sessions
    .lock()
    .unwrap()
    .insert(session_id.clone(), handle);

  Ok(())
}

/// Write data (keystrokes) into an existing PTY session.
#[tauri::command]
pub async fn kn_pty_write(
  session_id: String,
  data: String,
  state: State<'_, PtySessionState>,
) -> Result<(), String> {
  let sessions = state.sessions.lock().unwrap();
  let handle = sessions
    .get(&session_id)
    .ok_or_else(|| format!("PTY session {} not found", session_id))?;
  platform_write(handle, data.as_bytes())
}

/// Resize a PTY session.
#[tauri::command]
pub async fn kn_pty_resize(
  session_id: String,
  cols: u16,
  rows: u16,
  state: State<'_, PtySessionState>,
) -> Result<(), String> {
  let sessions = state.sessions.lock().unwrap();
  let handle = sessions
    .get(&session_id)
    .ok_or_else(|| format!("PTY session {} not found", session_id))?;
  platform_resize(handle, cols, rows)
}

/// Read recent terminal output lines for a session (or all sessions).
/// Returns the last `max_lines` lines from the ring buffer.
#[tauri::command]
pub async fn kn_pty_read_output(
  session_id: Option<String>,
  max_lines: Option<usize>,
) -> Result<HashMap<String, Vec<String>>, String> {
  Ok(read_terminal_output(session_id.as_deref(), max_lines.unwrap_or(100)))
}

/// Kill a PTY session and clean up resources.
#[tauri::command]
pub async fn kn_pty_kill(
  session_id: String,
  state: State<'_, PtySessionState>,
) -> Result<(), String> {
  let handle = state.sessions.lock().unwrap().remove(&session_id);
  if let Some(h) = handle {
    info!("[pty] killing session={}", session_id);
    platform_kill(&h);
  }
  Ok(())
}

// ══════════════════════════════════════════════════════════════════════
// Unix (macOS / Linux) implementation using POSIX openpty + fork
// ══════════════════════════════════════════════════════════════════════

#[cfg(unix)]
fn platform_spawn(
  app: &AppHandle,
  session_id: &str,
  cwd: Option<&str>,
  cols: u16,
  rows: u16,
) -> Result<PtyHandle, String> {
  use std::ffi::CString;
  use std::ptr;

  unsafe {
    let mut master: libc::c_int = 0;
    let mut slave: libc::c_int = 0;
    let mut ws = libc::winsize {
      ws_row: rows,
      ws_col: cols,
      ws_xpixel: 0,
      ws_ypixel: 0,
    };

    if libc::openpty(
      &mut master,
      &mut slave,
      ptr::null_mut(),
      ptr::null_mut(),
      &mut ws as *mut libc::winsize,
    ) != 0
    {
      return Err("openpty failed".into());
    }

    let pid = libc::fork();
    if pid < 0 {
      libc::close(master);
      libc::close(slave);
      return Err("fork failed".into());
    }

    if pid == 0 {
      // ── child process ──────────────────────────────────────
      libc::close(master);
      libc::setsid();
      // Set controlling terminal
      libc::ioctl(slave, libc::TIOCSCTTY as libc::c_ulong, 0);

      libc::dup2(slave, 0);
      libc::dup2(slave, 1);
      libc::dup2(slave, 2);
      if slave > 2 {
        libc::close(slave);
      }

      // Change directory
      if let Some(dir) = cwd {
        if let Ok(dir_c) = CString::new(dir) {
          libc::chdir(dir_c.as_ptr());
        }
      }

      // Set TERM so curses programs work
      let term = CString::new("TERM=xterm-256color").unwrap();
      libc::putenv(term.as_ptr() as *mut _);

      // Exec login shell
      let shell_path = std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".into());
      let shell_c = CString::new(shell_path.as_str()).unwrap();
      // Use -l for login shell (loads profile/PATH)
      let arg_login = CString::new("-l").unwrap();
      let argv: [*const libc::c_char; 3] = [shell_c.as_ptr(), arg_login.as_ptr(), ptr::null()];
      libc::execvp(shell_c.as_ptr(), argv.as_ptr());
      // If exec fails, exit child
      libc::_exit(127);
    }

    // ── parent process ─────────────────────────────────────────
    libc::close(slave);

    let alive = Arc::new(AtomicBool::new(true));
    let alive_reader = alive.clone();
    let app_clone = app.clone();
    let sid = session_id.to_string();
    let fd = master;

    // Background thread: read PTY output and emit events
    std::thread::Builder::new()
      .name(format!("pty-read-{}", session_id))
      .spawn(move || {
        let mut buf = [0u8; 4096];
        loop {
          if !alive_reader.load(Ordering::Relaxed) {
            break;
          }
          let n = libc::read(fd, buf.as_mut_ptr() as *mut _, buf.len());
          if n <= 0 {
            break;
          }
          let text = String::from_utf8_lossy(&buf[..n as usize]).to_string();

          // Push to global ring buffer so chat AI can read terminal output
          for line in text.lines() {
            push_terminal_line(&sid, line);
          }

          let _ = app_clone.emit_all(
            "pty-output",
            json!({
                "sessionId": sid,
                "data": text,
            }),
          );
        }
        alive_reader.store(false, Ordering::Relaxed);
        let _ = app_clone.emit_all(
          "pty-exit",
          json!({
              "sessionId": sid,
          }),
        );
        // Reap the child
        let mut status: libc::c_int = 0;
        libc::waitpid(pid, &mut status, 0);
        info!("[pty] session {} exited", sid);
      })
      .map_err(|e| format!("Failed to spawn reader thread: {}", e))?;

    Ok(PtyHandle {
      alive,
      master_fd: master,
      child_pid: pid,
    })
  }
}

#[cfg(unix)]
fn platform_write(handle: &PtyHandle, data: &[u8]) -> Result<(), String> {
  unsafe {
    let n = libc::write(handle.master_fd, data.as_ptr() as *const _, data.len());
    if n < 0 {
      Err("PTY write failed".into())
    } else {
      Ok(())
    }
  }
}

#[cfg(unix)]
fn platform_resize(handle: &PtyHandle, cols: u16, rows: u16) -> Result<(), String> {
  let mut ws = libc::winsize {
    ws_row: rows,
    ws_col: cols,
    ws_xpixel: 0,
    ws_ypixel: 0,
  };
  let ret = unsafe { libc::ioctl(handle.master_fd, libc::TIOCSWINSZ as libc::c_ulong, &mut ws) };
  if ret < 0 {
    Err("PTY resize failed".into())
  } else {
    Ok(())
  }
}

#[cfg(unix)]
fn platform_kill(handle: &PtyHandle) {
  handle.alive.store(false, Ordering::Relaxed);
  unsafe {
    libc::kill(handle.child_pid, libc::SIGTERM);
    libc::close(handle.master_fd);
  }
}

// ══════════════════════════════════════════════════════════════════════
// Windows implementation using ConPTY
// ══════════════════════════════════════════════════════════════════════

#[cfg(windows)]
mod conpty {
  //! Raw FFI declarations for the ConPTY API (Windows 10 1809+).
  #![allow(non_snake_case, non_camel_case_types)]
  use std::ffi::c_void;

  pub type HANDLE = *mut c_void;
  pub type HPCON = isize;
  pub type HRESULT = i32;
  pub type BOOL = i32;
  pub type DWORD = u32;

  #[repr(C)]
  #[derive(Copy, Clone)]
  pub struct COORD {
    pub X: i16,
    pub Y: i16,
  }

  #[repr(C)]
  pub struct SECURITY_ATTRIBUTES {
    pub nLength: DWORD,
    pub lpSecurityDescriptor: *mut c_void,
    pub bInheritHandle: BOOL,
  }

  #[repr(C)]
  pub struct STARTUPINFOEXW {
    pub StartupInfo: STARTUPINFOW,
    pub lpAttributeList: *mut c_void,
  }

  #[repr(C)]
  pub struct STARTUPINFOW {
    pub cb: DWORD,
    pub lpReserved: *mut u16,
    pub lpDesktop: *mut u16,
    pub lpTitle: *mut u16,
    pub dwX: DWORD,
    pub dwY: DWORD,
    pub dwXSize: DWORD,
    pub dwYSize: DWORD,
    pub dwXCountChars: DWORD,
    pub dwYCountChars: DWORD,
    pub dwFillAttribute: DWORD,
    pub dwFlags: DWORD,
    pub wShowWindow: u16,
    pub cbReserved2: u16,
    pub lpReserved2: *mut u8,
    pub hStdInput: HANDLE,
    pub hStdOutput: HANDLE,
    pub hStdError: HANDLE,
  }

  #[repr(C)]
  pub struct PROCESS_INFORMATION {
    pub hProcess: HANDLE,
    pub hThread: HANDLE,
    pub dwProcessId: DWORD,
    pub dwThreadId: DWORD,
  }

  pub const EXTENDED_STARTUPINFO_PRESENT: DWORD = 0x00080000;
  pub const CREATE_NO_WINDOW: DWORD = 0x08000000;
  pub const PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE: usize = 0x00020016;
  pub const STARTF_USESHOWWINDOW: DWORD = 0x00000001;
  pub const INVALID_HANDLE_VALUE: HANDLE = -1isize as HANDLE;

  extern "system" {
    pub fn CreatePipe(
      hReadPipe: *mut HANDLE,
      hWritePipe: *mut HANDLE,
      lpPipeAttributes: *const SECURITY_ATTRIBUTES,
      nSize: DWORD,
    ) -> BOOL;

    pub fn CreatePseudoConsole(
      size: COORD,
      hInput: HANDLE,
      hOutput: HANDLE,
      dwFlags: DWORD,
      phPC: *mut HPCON,
    ) -> HRESULT;

    pub fn ResizePseudoConsole(hPC: HPCON, size: COORD) -> HRESULT;

    pub fn ClosePseudoConsole(hPC: HPCON);

    pub fn InitializeProcThreadAttributeList(
      lpAttributeList: *mut c_void,
      dwAttributeCount: DWORD,
      dwFlags: DWORD,
      lpSize: *mut usize,
    ) -> BOOL;

    pub fn UpdateProcThreadAttribute(
      lpAttributeList: *mut c_void,
      dwFlags: DWORD,
      Attribute: usize,
      lpValue: *const c_void,
      cbSize: usize,
      lpPreviousValue: *mut c_void,
      lpReturnSize: *mut usize,
    ) -> BOOL;

    pub fn CreateProcessW(
      lpApplicationName: *const u16,
      lpCommandLine: *mut u16,
      lpProcessAttributes: *const c_void,
      lpThreadAttributes: *const c_void,
      bInheritHandles: BOOL,
      dwCreationFlags: DWORD,
      lpEnvironment: *const c_void,
      lpCurrentDirectory: *const u16,
      lpStartupInfo: *const STARTUPINFOW,
      lpProcessInformation: *mut PROCESS_INFORMATION,
    ) -> BOOL;

    pub fn ReadFile(
      hFile: HANDLE,
      lpBuffer: *mut c_void,
      nNumberOfBytesToRead: DWORD,
      lpNumberOfBytesRead: *mut DWORD,
      lpOverlapped: *mut c_void,
    ) -> BOOL;

    pub fn WriteFile(
      hFile: HANDLE,
      lpBuffer: *const c_void,
      nNumberOfBytesToWrite: DWORD,
      lpNumberOfBytesWritten: *mut DWORD,
      lpOverlapped: *mut c_void,
    ) -> BOOL;

    pub fn CloseHandle(hObject: HANDLE) -> BOOL;

    pub fn WaitForSingleObject(hHandle: HANDLE, dwMilliseconds: DWORD) -> DWORD;
  }
}

#[cfg(windows)]
fn platform_spawn(
  app: &AppHandle,
  session_id: &str,
  cwd: Option<&str>,
  cols: u16,
  rows: u16,
) -> Result<PtyHandle, String> {
  use conpty::*;
  use std::mem::{size_of, zeroed};
  use std::ptr;

  let (out_read_usize, proc_usize, write_usize, process_usize, hpc_val) = unsafe {
    // Create pipes: pty_in_read  → PTY stdin,  app writes to pty_in_write
    //               pty_out_read ← PTY stdout, app reads from pty_out_read
    let mut pty_in_read: HANDLE = ptr::null_mut();
    let mut pty_in_write: HANDLE = ptr::null_mut();
    let mut pty_out_read: HANDLE = ptr::null_mut();
    let mut pty_out_write: HANDLE = ptr::null_mut();

    if CreatePipe(&mut pty_in_read, &mut pty_in_write, ptr::null(), 0) == 0 {
      return Err("CreatePipe (stdin) failed".into());
    }
    if CreatePipe(&mut pty_out_read, &mut pty_out_write, ptr::null(), 0) == 0 {
      CloseHandle(pty_in_read);
      CloseHandle(pty_in_write);
      return Err("CreatePipe (stdout) failed".into());
    }

    // Create pseudo console
    let size = COORD {
      X: cols as i16,
      Y: rows as i16,
    };
    let mut hpc: HPCON = 0;
    let hr = CreatePseudoConsole(size, pty_in_read, pty_out_write, 0, &mut hpc);
    if hr != 0 {
      CloseHandle(pty_in_read);
      CloseHandle(pty_in_write);
      CloseHandle(pty_out_read);
      CloseHandle(pty_out_write);
      return Err(format!("CreatePseudoConsole failed: 0x{:08x}", hr));
    }

    // Build attribute list for the process
    let mut attr_size: usize = 0;
    InitializeProcThreadAttributeList(ptr::null_mut(), 1, 0, &mut attr_size);
    let attr_list = vec![0u8; attr_size];
    let attr_list_ptr = attr_list.as_ptr() as *mut std::ffi::c_void;
    if InitializeProcThreadAttributeList(attr_list_ptr, 1, 0, &mut attr_size) == 0 {
      ClosePseudoConsole(hpc);
      CloseHandle(pty_in_read);
      CloseHandle(pty_in_write);
      CloseHandle(pty_out_read);
      CloseHandle(pty_out_write);
      return Err("InitializeProcThreadAttributeList failed".into());
    }

    if UpdateProcThreadAttribute(
      attr_list_ptr,
      0,
      PROC_THREAD_ATTRIBUTE_PSEUDOCONSOLE,
      &hpc as *const _ as *const _,
      size_of::<HPCON>(),
      ptr::null_mut(),
      ptr::null_mut(),
    ) == 0
    {
      ClosePseudoConsole(hpc);
      CloseHandle(pty_in_read);
      CloseHandle(pty_in_write);
      CloseHandle(pty_out_read);
      CloseHandle(pty_out_write);
      return Err("UpdateProcThreadAttribute failed".into());
    }

    // Prepare STARTUPINFOEXW – hide the console window so cmd.exe
    // doesn't flash on-screen; the pseudo-console handles all I/O.
    let mut si: STARTUPINFOEXW = zeroed();
    si.StartupInfo.cb = size_of::<STARTUPINFOEXW>() as DWORD;
    si.StartupInfo.dwFlags = STARTF_USESHOWWINDOW;
    // wShowWindow is already 0 (SW_HIDE) from zeroed()
    si.lpAttributeList = attr_list_ptr;

    let mut pi: PROCESS_INFORMATION = zeroed();

    // Command: cmd.exe
    let cmd: Vec<u16> = "cmd.exe\0".encode_utf16().collect();
    let mut cmd_mut = cmd;

    let cwd_wide: Option<Vec<u16>> = cwd.map(|d| {
      let mut v: Vec<u16> = d.encode_utf16().collect();
      v.push(0);
      v
    });
    let cwd_ptr = cwd_wide.as_ref().map(|v| v.as_ptr()).unwrap_or(ptr::null());

    if CreateProcessW(
      ptr::null(),
      cmd_mut.as_mut_ptr(),
      ptr::null(),
      ptr::null(),
      0,
      EXTENDED_STARTUPINFO_PRESENT | CREATE_NO_WINDOW,
      ptr::null(),
      cwd_ptr,
      &si.StartupInfo as *const _,
      &mut pi,
    ) == 0
    {
      ClosePseudoConsole(hpc);
      CloseHandle(pty_in_read);
      CloseHandle(pty_in_write);
      CloseHandle(pty_out_read);
      CloseHandle(pty_out_write);
      return Err("CreateProcessW failed".into());
    }

    // Close handles we no longer need in the parent
    CloseHandle(pty_in_read);
    CloseHandle(pty_out_write);
    CloseHandle(pi.hThread);

    // Cast ALL raw pointers to usize so no *mut c_void exists outside
    // the unsafe block (usize is Send, *mut c_void is not).
    let out_read_usize = pty_out_read as usize;
    let proc_usize = pi.hProcess as usize;
    let write_usize = pty_in_write as usize;
    let process_usize = pi.hProcess as usize;
    let hpc_val = hpc;

    (out_read_usize, proc_usize, write_usize, process_usize, hpc_val)
  };
  // ── Now outside the unsafe block ──

  let alive = Arc::new(AtomicBool::new(true));
  let alive_reader = alive.clone();
  let app_clone = app.clone();
  let sid = session_id.to_string();

  // Background thread: read output from ConPTY
  std::thread::Builder::new()
    .name(format!("pty-read-{}", session_id))
    .spawn(move || {
      let read_handle = out_read_usize as *mut std::ffi::c_void;
      let proc_handle = proc_usize as *mut std::ffi::c_void;
      let mut buf = [0u8; 4096];
      loop {
        if !alive_reader.load(Ordering::Relaxed) {
          break;
        }
        let mut bytes_read: u32 = 0;
        let ok = unsafe {
          conpty::ReadFile(
            read_handle,
            buf.as_mut_ptr() as *mut _,
            buf.len() as u32,
            &mut bytes_read,
            std::ptr::null_mut(),
          )
        };
        if ok == 0 || bytes_read == 0 {
          break;
        }
        let text = String::from_utf8_lossy(&buf[..bytes_read as usize]).to_string();

        // Push to global ring buffer so chat AI can read terminal output
        for line in text.lines() {
          push_terminal_line(&sid, line);
        }

        let _ = app_clone.emit_all(
          "pty-output",
          json!({
              "sessionId": sid,
              "data": text,
          }),
        );
      }
      alive_reader.store(false, Ordering::Relaxed);
      let _ = app_clone.emit_all(
        "pty-exit",
        json!({
            "sessionId": sid,
        }),
      );
      unsafe {
        conpty::CloseHandle(read_handle);
        conpty::WaitForSingleObject(proc_handle, 5000);
        conpty::CloseHandle(proc_handle);
      }
      info!("[pty] session {} exited", sid);
    })
    .map_err(|e| format!("Failed to spawn reader thread: {}", e))?;

  Ok(PtyHandle {
    alive,
    write_handle: write_usize as *mut std::ffi::c_void,
    process_handle: process_usize as *mut std::ffi::c_void,
    hpc: hpc_val,
  })
}

#[cfg(windows)]
fn platform_write(handle: &PtyHandle, data: &[u8]) -> Result<(), String> {
  unsafe {
    let mut written: conpty::DWORD = 0;
    let ok = conpty::WriteFile(
      handle.write_handle,
      data.as_ptr() as *const _,
      data.len() as conpty::DWORD,
      &mut written,
      std::ptr::null_mut(),
    );
    if ok == 0 {
      Err("PTY write failed".into())
    } else {
      Ok(())
    }
  }
}

#[cfg(windows)]
fn platform_resize(handle: &PtyHandle, cols: u16, rows: u16) -> Result<(), String> {
  let size = conpty::COORD {
    X: cols as i16,
    Y: rows as i16,
  };
  let hr = unsafe { conpty::ResizePseudoConsole(handle.hpc, size) };
  if hr != 0 {
    Err(format!("ResizePseudoConsole failed: 0x{:08x}", hr))
  } else {
    Ok(())
  }
}

#[cfg(windows)]
fn platform_kill(handle: &PtyHandle) {
  handle.alive.store(false, Ordering::Relaxed);
  unsafe {
    conpty::ClosePseudoConsole(handle.hpc);
    conpty::CloseHandle(handle.write_handle);
  }
}
