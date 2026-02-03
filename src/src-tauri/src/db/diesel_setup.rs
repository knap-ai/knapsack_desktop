use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

use crate::db::db::{ KNAPSACK_DB_FILENAME };

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn execute_migrations() -> Result<(), Box<dyn std::error::Error>> {
    log::debug!("--------------------- Executing migrations --------------------");
    let home_dir = dirs::home_dir().expect("Could not determine the home directory");
    let db_path = home_dir.join(KNAPSACK_DB_FILENAME);

    let db_url = db_path.to_str().ok_or("Invalid database path")?;

    let mut connection = SqliteConnection::establish(db_url)
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    connection.run_pending_migrations(MIGRATIONS)
        .map_err(|e| format!("Failed to run migrations: {}", e))?;

    log::debug!("--------------- Migrations executed successfully ---------------");
    Ok(())
}
