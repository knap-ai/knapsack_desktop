use once_cell::sync::Lazy;
use r2d2::{Pool, PooledConnection};
use r2d2_sqlite::SqliteConnectionManager;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::connections::google::constants::{
  GOOGLE_CALENDAR_SCOPE, GOOGLE_DRIVE_SCOPE, GOOGLE_GMAIL_SCOPE, GOOGLE_PROFILE_SCOPE,
  GOOGLE_PROVIDER_NAME,
};
use crate::connections::microsoft::constants::{
  MICROSOFT_PROFILE_SCOPE, MICROSOFT_CALENDAR_SCOPE, MICROSOFT_OUTLOOK_SCOPE,
  MICROSOFT_PROVIDER_NAME, MICROSOFT_ONEDRIVE_SCOPE,
};
use crate::db::models::{
  automation::Automation,
  automation_step::AutomationStep,
  cadence_trigger::CadenceTrigger,
  connection::Connection,
  feed_item::FeedItem,
  message::Message,
  thread::{Thread, ThreadType},
};
use crate::memory::qdrant;

use super::models::data_source_trigger::DataSourceTrigger;
use crate::db::diesel_setup::execute_migrations;

pub const KNAPSACK_DB_FILENAME: &str = ".knapsack.db";
const DB_VERSION: u16 = 18;
const QDRANT_DB_VERSION: u16 = 2;
const MAX_DB_CONNECTIONS: u32 = 10;

type SqlitePool = Pool<SqliteConnectionManager>;

const AFTER_CONNECT: &str = "PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=1000;";

fn create_pool() -> SqlitePool {
  let home_dir = dirs::home_dir().expect("Couldn't get home_dir for platform.");
  let db_pathbuf = home_dir.join(KNAPSACK_DB_FILENAME);
  let db_path = db_pathbuf.as_path();

  let manager = SqliteConnectionManager::file(db_path.to_str().unwrap())
    .with_init(|connection| connection.execute_batch(AFTER_CONNECT));
  Pool::builder()
    .max_size(MAX_DB_CONNECTIONS)
    .build(manager)
    .expect("Failed to create pool.")
}

static DB_CONNECTION_POOL: Lazy<SqlitePool> = Lazy::new(|| create_pool());

pub fn get_db_conn() -> PooledConnection<SqliteConnectionManager> {
  let conn: PooledConnection<SqliteConnectionManager> = DB_CONNECTION_POOL.get().unwrap();
  return conn;
}

pub fn delete_old_tables() {
  let connection = create_pool().get().unwrap();
  let current_tables = vec![
    "__diesel_schema_migrations",
    "db_version",
    "emails",
    "local_files",
    "calendar_events",
    "drive_documents",
    "automation_steps",
    "automations",
    "cadence_triggers",
    "data_source_triggers",
    "automation_runs",
    "messages",
    "threads",
    "documents",
    "message_feedbacks",
    "feed_items",
    "user_connections",
  ];
  for table in current_tables {
    let sql = format!("DROP TABLE IF EXISTS {table}");
    connection
      .execute(&sql, ())
      .expect(&format!("Could not create {table} database table"));
  }
}

fn should_delete_old_tables() -> bool {
  let connection = create_pool().get().unwrap();
  let stmt = connection.prepare("SELECT version FROM db_version");
  match stmt {
    Ok(mut stmt) => {
      let rows = stmt.query_map([], |row| Ok(row.get::<_, u16>(0).unwrap()));
      match rows {
        Ok(rows) => {
          for row in rows {
            match row {
              Ok(current_database_version) => {
                if current_database_version != DB_VERSION {
                  return true;
                }
              }
              Err(_) => return true,
            }
          }
        }
        Err(_) => return true,
      }
    }
    Err(_) => return true,
  }
  return false;
}

async fn clean_qdrant() {
  match qdrant::delete_knapsack_collection().await {
    Ok(_) => log::info!("Deleted knapsack collection to update VectorDB schema."),
    Err(e) => log::error!("Failed to delete knapsack collection: {:?}", e),
  }
}

fn should_clean_qdrant() -> bool {
  let connection = create_pool().get().unwrap();
  let stmt = connection.prepare("SELECT qdrant_version FROM db_version");
  match stmt {
    Ok(mut stmt) => {
      let rows = stmt.query_map([], |row| Ok(row.get::<_, u16>(0).unwrap()));
      match rows {
        Ok(rows) => {
          for row in rows {
            match row {
              Ok(current_database_version) => {
                if current_database_version != DB_VERSION {
                  return true;
                }
              }
              Err(_) => return true,
            }
          }
        }
        Err(_) => return true,
      }
    }
    Err(_) => return true,
  }
  return false;
}


//TODO: return a error if the start fails
pub async fn start_database() {
  if let Err(e) = execute_migrations() {
    log::error!("Error running migrations: {:?}", e);
    std::process::exit(1);
  }

  let mut meeting_prep_automation = Automation {
    id: None,
    uuid: String::from("46a65eb7-d0df-5b0c-9191-5c86f84f532d"),
    name: String::from("Meeting Prep"),
    description: String::from(
      "Prepare a report for your next meeting by synthesizing data from your email, calendar, contacts, and web.",
    ),
    is_active: false,
    is_beta: false,
    show_library: false,
    icon: String::from("/assets/images/icons/meeting-prep-icon.svg"),
    runs: Some(vec![]),
    trigger_cadences: None,
    trigger_data_sources: Some(vec![DataSourceTrigger {
      id: None,
      automation_uuid: String::from("46a65eb7-d0df-5b0c-9191-5c86f84f532d"),
      data_source: String::from("google_calendar"),
      offset_minutes: -60,
    }]),
    steps: Some(vec![AutomationStep {
      id: None,
      automation_uuid: String::from("46a65eb7-d0df-5b0c-9191-5c86f84f532d"),
      name: String::from("meeting-prep"),
      ordering: 0,
      args_json: None,
    }]),
  };

  let mut email_summary_automation = Automation {
    id: None,
    uuid: String::from("6a9b3fa2-ec22-5f09-8808-424b987a019e"),
    name: String::from("Email Summary"),
    description: String::from("Provide a summary of all emails within the last 24 hours."),
    is_active: false,
    is_beta: false,
    show_library: true,
    icon: String::from("/assets/images/icons/email-icon.svg"),
    runs: Some(vec![]),
    trigger_cadences: Some(vec![]),
    trigger_data_sources: None,
    steps: Some(vec![AutomationStep {
      id: None,
      automation_uuid: String::from("6a9b3fa2-ec22-5f09-8808-424b987a019e"),
      name: String::from("email-summary"),
      ordering: 0,
      args_json: None,
    }]),
  };

  let mut finra_compliance_automation = Automation {
    id: None,
    uuid: String::from("ee3c0d1e-603a-5450-a0d7-86c1dbf745d4"),
    name: String::from("Email RegCheck"),
    description: String::from("Check FINRA compliance of all emails that were sent today."),
    is_active: false,
    is_beta: false,
    show_library: true,
    icon: String::from("/assets/images/icons/email-icon.svg"),
    runs: Some(vec![]),
    trigger_cadences: Some(vec![]),
    trigger_data_sources: None,
    steps: Some(vec![AutomationStep {
      id: None,
      automation_uuid: String::from("ee3c0d1e-603a-5450-a0d7-86c1dbf745d4"),
      name: String::from("finra-compliance"),
      ordering: 0,
      args_json: None,
    }]),
  };

  // let mut about_me_automation = Automation {
  //   id: None,
  //   uuid: String::from("87f5545c-5ee1-41a4-8ddb-9a00c650a791"),
  //   name: String::from("About me"),
  //   description: String::from(
  //     "Returns a detailed bio of the user based on their documents and web search.",
  //   ),
  //   is_active: false,
  //   is_beta: true,
  //   show_library: true,
  //   icon: String::from("/assets/images/icons/profile-icon.svg"),
  //   runs: Some(vec![]),
  //   trigger_cadences: Some(vec![]),
  //   trigger_data_sources: None,
  //   steps: Some(vec![AutomationStep {
  //     id: None,
  //     automation_uuid: String::from("87f5545c-5ee1-41a4-8ddb-9a00c650a791"),
  //     name: String::from("about-me"),
  //     ordering: 0,
  //     args_json: None,
  //   }]),
  // };

  let mut strategic_plan_automation = Automation {
    id: None,
    uuid: String::from("fc7f6f0e-f85a-4eed-a093-0bbe317004ef"),
    name: String::from("Strategic Plan"),
    description: String::from("Create Strategic Plan"),
    is_active: false,
    is_beta: true,
    show_library: true,
    icon: String::from("/assets/images/icons/strategy-icon.svg"),
    runs: Some(vec![]),
    trigger_cadences: Some(vec![]),
    trigger_data_sources: None,
    steps: Some(vec![AutomationStep {
      id: None,
      automation_uuid: String::from("fc7f6f0e-f85a-4eed-a093-0bbe317004ef"),
      name: String::from("strategic-plan"),
      ordering: 0,
      args_json: None,
    }]),
  };

  let mut post_safely_automation = Automation {
    id: None,
    uuid: String::from("fa5bc3e1-ecb6-454b-85b7-6694abd03309"),
    name: String::from("LinkedIn Post Ideas"),
    description: String::from(
      "Write LinkedIn posts using my own expertise and relevant topics.",
    ),
    is_active: false,
    is_beta: true,
    show_library: true,
    icon: String::from("/assets/images/icons/content-icon.svg"),
    runs: Some(vec![]),
    trigger_cadences: Some(vec![]),
    trigger_data_sources: None,
    steps: Some(vec![AutomationStep {
      id: None,
      automation_uuid: String::from("fa5bc3e1-ecb6-454b-85b7-6694abd03309"),
      name: String::from("post-safely"),
      ordering: 0,
      args_json: None,
    }]),
  };

  let mut business_coach_automation = Automation {
    id: None,
    uuid: String::from("0874e460-9d14-4d89-9a78-8c79d8718ab9"),
    name: String::from("Business Coach"),
    description: String::from("Thought partner for business strategies."),
    is_active: false,
    is_beta: true,
    show_library: true,
    icon: String::from("/assets/images/icons/strategy-icon.svg"),
    runs: Some(vec![]),
    trigger_cadences: Some(vec![]),
    trigger_data_sources: None,
    steps: Some(vec![AutomationStep {
      id: None,
      automation_uuid: String::from("0874e460-9d14-4d89-9a78-8c79d8718ab9"),
      name: String::from("business-coach"),
      ordering: 0,
      args_json: None,
    }]),
  };

  let mut social_media_planner_automation = Automation {
    id: None,
    uuid: String::from("c07df858-c664-47af-a965-4b28efaa18fc"),
    name: String::from("Social Media Planner"),
    description: String::from("Create a cohesive social media campaign."),
    is_active: false,
    is_beta: true,
    show_library: true,
    icon: String::from("/assets/images/icons/content-icon.svg"),
    runs: Some(vec![]),
    trigger_cadences: Some(vec![]),
    trigger_data_sources: None,
    steps: Some(vec![AutomationStep {
      id: None,
      automation_uuid: String::from("c07df858-c664-47af-a965-4b28efaa18fc"),
      name: String::from("social-media-planner"),
      ordering: 0,
      args_json: None,
    }]),
  };

  let mut lead_scoring_automation = Automation {
    id: None,
    uuid: String::from("012d3c1a-1749-48e4-9be3-608bde9679c6"),
    name: String::from("Sales Lead Scoring"),
    description: String::from("Lead Scoring from email and web data."),
    is_active: false,
    is_beta: true,
    show_library: true,
    icon: String::from("/assets/images/icons/profile-icon.svg"),
    runs: Some(vec![]),
    trigger_cadences: Some(vec![]),
    trigger_data_sources: None,
    steps: Some(vec![AutomationStep {
      id: None,
      automation_uuid: String::from("012d3c1a-1749-48e4-9be3-608bde9679c6"),
      name: String::from("lead-scoring"),
      ordering: 0,
      args_json: None,
    }]),
  };

  let meeting_prep_res = meeting_prep_automation.create();
  match meeting_prep_res {
    Ok(_) => println!("Created meeting prep automation"),
    Err(e) => println!("Error creating meeting prep automation: {:?}", e),
  }
  let email_summary_res = email_summary_automation.create();
  match email_summary_res {
    Ok(_) => println!("Created email summary automation"),
    Err(e) => println!("Error creating email summary automation: {:?}", e),
  }
  let finra_compliance_automation_res = finra_compliance_automation.create();
  match finra_compliance_automation_res {
    Ok(_) => println!("Created FINRA compliance automation"),
    Err(e) => println!("Error creating FINRA compliance automation: {:?}", e),
  }
  let strategic_plan_res = strategic_plan_automation.create();
  match strategic_plan_res {
    Ok(_) => println!("Created strategic plan automation"),
    Err(e) => println!("Error creating strategic plan automation: {:?}", e),
  }

  let post_safely_automation_res = post_safely_automation.create();
  match post_safely_automation_res {
    Ok(_) => println!("Created Post Safely automation"),
    Err(e) => println!("Error creating Post Safely automation: {:?}", e),
  }

  let business_coach_automation_res = business_coach_automation.create();
  match business_coach_automation_res {
    Ok(_) => println!("Created Business Coach automation"),
    Err(e) => println!("Error creating Business Coach automation: {:?}", e),
  }
  // let about_me_automation_res = about_me_automation.create();
  // match about_me_automation_res {
  //   Ok(_) => println!("Created About me automation"),
  //   Err(e) => println!("Error creating About me automation: {:?}", e),
  // }

  let social_media_planner_automation_res = social_media_planner_automation.create();
  match social_media_planner_automation_res {
    Ok(_) => println!("Created Social Media Planner automation"),
    Err(e) => println!("Error creating Social Media Planner automation: {:?}", e),
  }

  let lead_scoring_res = lead_scoring_automation.create();
  match lead_scoring_res {
    Ok(_) => println!("Created Lead Scoring automation"),
    Err(e) => println!("Error creating Lead Scoring automation: {:?}", e),
  }

  let start = SystemTime::now();
  let now_timestamp = start
    .duration_since(UNIX_EPOCH)
    .expect("Time went backwards");

  let result = Connection {
    id: None,
    provider: format!("{GOOGLE_PROVIDER_NAME}"),
    scope: format!("{GOOGLE_PROFILE_SCOPE}"),
  }
  .create();
  if let Err(error) = result {
    log::error!("Failed to create connection {:?} ", error)
  }

  let result = Connection {
    id: None,
    provider: format!("{GOOGLE_PROVIDER_NAME}"),
    scope: format!("{GOOGLE_CALENDAR_SCOPE}"),
  }
  .create();
  if let Err(error) = result {
    log::error!("Failed to create connection {:?} ", error)
  }

  let result = Connection {
    id: None,
    provider: format!("{GOOGLE_PROVIDER_NAME}"),
    scope: format!("{GOOGLE_DRIVE_SCOPE}"),
  }
  .create();
  if let Err(error) = result {
    log::error!("Failed to create connection {:?} ", error)
  }

  let result = Connection {
    id: None,
    provider: format!("{GOOGLE_PROVIDER_NAME}"),
    scope: format!("{GOOGLE_GMAIL_SCOPE}"),
  }
  .create();
  if let Err(error) = result {
    log::error!("Failed to create connection {:?} ", error)
  }

  let result = Connection {
    id: None,
    provider: format!("{MICROSOFT_PROVIDER_NAME}"),
    scope: format!("{MICROSOFT_PROFILE_SCOPE}"),
  }
  .create();
  if let Err(error) = result {
    log::error!("Failed to create connection {:?} ", error)
  }

  let result = Connection {
    id: None,
    provider: format!("{MICROSOFT_PROVIDER_NAME}"),
    scope: format!("{MICROSOFT_CALENDAR_SCOPE}"),
  }
  .create();
  if let Err(error) = result {
    log::error!("Failed to create connection {:?} ", error)
  }

  let result = Connection {
    id: None,
    provider: format!("{MICROSOFT_PROVIDER_NAME}"),
    scope: format!("{MICROSOFT_OUTLOOK_SCOPE}"),
  }
  .create();
  if let Err(error) = result {
    log::error!("Failed to create connection {:?} ", error)
  }

  let result = Connection {
    id: None,
    provider: format!("{MICROSOFT_PROVIDER_NAME}"),
    scope: format!("{MICROSOFT_ONEDRIVE_SCOPE}"),
  }
  .create();
  if let Err(error) = result {
    log::error!("Failed to create connection {:?} ", error)
  }

}
