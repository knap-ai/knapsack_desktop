use log4rs::{
  append::console::ConsoleAppender,
  append::rolling_file::{policy::compound::{CompoundPolicy, roll::fixed_window::FixedWindowRoller, trigger::size::SizeTrigger}, RollingFileAppender},
  config::{Appender, Config, Root},
  encode::pattern::PatternEncoder,
  filter::threshold::ThresholdFilter,
};
use log::LevelFilter;
use sentry;

use crate::error::Error;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;



fn get_user_uuid_from_profile() -> Option<(String, String)> {
  let home_dir = dirs::home_dir()?;
  let profile_path = home_dir.join(".knapsack").join("profile.dat");
  
  match fs::read_to_string(profile_path) {
    Ok(content) => {
      match serde_json::from_str::<Value>(&content) {
        Ok(json) => {
          let profile = json.get("KN_PROFILE")?;
          let uuid = profile.get("uuid")?.as_str()?.to_string();
          let email = profile.get("email")?.as_str()?.to_string();
          Some((uuid, email))
        },
        Err(e) => {
          log::warn!("Failed to parse profile.dat: {}", e);
          None
        }
      }
    },
    Err(e) => {
      log::warn!("Failed to read profile.dat: {}", e);
      None
    }
  }
}

pub fn knap_log_error(msg: String, error: Option<Error>, slack_flag: Option<bool>) -> Error {
  let should_notify_slack = slack_flag.unwrap_or(false);
  if let Some((uuid, email)) = get_user_uuid_from_profile() {
    sentry::configure_scope(|scope| {
      scope.set_user(Some(sentry::User {
        id: Some(uuid.clone()),
        email: Some(email.clone()),
        ..Default::default()
      }));
      if should_notify_slack {
        scope.set_tag("slackNotification", "true");
      } else {
        scope.set_tag("slackNotification", "false");
      }
    });
    
    // Log with user UUID
    log::error!("[User: {}] {}: {:?}", uuid, msg, error);
  } 
  sentry::capture_message(
    &format!("{}: {:?}", msg, error),
    sentry::Level::Error
  );
  log::error!("{}: {:?}", msg, error);
  Error::KSError(format!("{}: {:?}", msg, error))
}

pub fn knap_log_debug(msg: String, error: Option<Error>) -> Error {
  if let Some((uuid, email)) = get_user_uuid_from_profile() {
    sentry::configure_scope(|scope| {
      scope.set_user(Some(sentry::User {
        id: Some(uuid.clone()),
        email: Some(email),
        ..Default::default()
      }));
    });
    
    // Log with user UUID
    log::error!("[User: {}] {}: {:?}", uuid, msg, error);
  } 
  sentry::capture_message(
    &format!("{}: {:?}", msg, error),
    sentry::Level::Debug
  );
  log::error!("{}: {:?}", msg, error);
  Error::KSError(format!("{}: {:?}", msg, error))
}

pub fn setup_logger(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {

  let log_dir = app
    .handle()
    .path_resolver()
    .app_log_dir()
    .unwrap_or_default();

  std::fs::create_dir_all(&log_dir)?;

  let stdout = ConsoleAppender::builder()
    .encoder(Box::new(PatternEncoder::new("{d(%Y-%m-%d %H:%M:%S)} [{l}] {t} - {m}{n}")))
    .build();

  let size_trigger = SizeTrigger::new(10 * 1024 * 1024); // 10 MB
  let roller = FixedWindowRoller::builder()
    .build("ks.{}.log", 5)?; // Keeps 5 backup logs
  let compound_policy = CompoundPolicy::new(
    Box::new(size_trigger), Box::new(roller.clone()));
  // Create rolling file appender for all logs
  let all_logs = RollingFileAppender::builder()
    .encoder(Box::new(PatternEncoder::new("{d(%Y-%m-%d %H:%M:%S)} [{l}] {t} - {m}{n}")))
    .build(log_dir.join("ks.log"), Box::new(compound_policy))?;

  // error logs only
  let size_trigger = SizeTrigger::new(10 * 1024 * 1024); // 10 MB
  let roller = FixedWindowRoller::builder()
    .build("ks_error.{}.log", 5)?; // Keeps 5 backup logs
  let compound_policy = CompoundPolicy::new(
    Box::new(size_trigger), Box::new(roller.clone()));
  // Create rolling file appender for error logs
  let error_logs = RollingFileAppender::builder()
    .encoder(Box::new(PatternEncoder::new("{d(%Y-%m-%d %H:%M:%S)} [{l}] {t} - {m}{n}")))
    .build(log_dir.join("ks_error.log"), Box::new(compound_policy))?;

  let config = Config::builder()
    .appender(Appender::builder().build("stdout", Box::new(stdout)))
    .appender(Appender::builder().build("all_logs", Box::new(all_logs)))
    .appender(
      Appender::builder()
      .filter(Box::new(ThresholdFilter::new(LevelFilter::Error)))
      .build("error_logs", Box::new(error_logs)),
    )
    .build(
      Root::builder()
      .appender("stdout")
      .appender("all_logs")
      .appender("error_logs")
      .build(LevelFilter::Info),
    )?;

  log4rs::init_config(config)?;

  Ok(())
}


