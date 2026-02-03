use rusqlite::{params, OptionalExtension, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::error::Error;

use crate::db::db::get_db_conn;
use crate::db::models::automation_run::AutomationRun;
use crate::db::models::automation_step::AutomationStep;
use crate::db::models::cadence_trigger::CadenceTrigger;

use super::data_source_trigger::DataSourceTrigger;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Automation {
  pub id: Option<u64>,
  pub uuid: String,
  pub name: String,
  pub description: String,
  pub runs: Option<Vec<AutomationRun>>,
  pub trigger_cadences: Option<Vec<CadenceTrigger>>,
  pub trigger_data_sources: Option<Vec<DataSourceTrigger>>,
  pub steps: Option<Vec<AutomationStep>>,
  pub is_active: bool,
  pub is_beta: bool,
  pub show_library: bool,
  pub icon: String,
}

impl Automation {
  pub fn find_by_id(id: String) -> Result<Option<Automation>> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT id, uuid, name, is_active, description, is_beta, show_library FROM automations WHERE id = ?1",
    )?;
    let automation = stmt
      .query_row(params![id], |row| Automation::build_struct_from_row(row))
      .optional()?;

    Ok(automation)
  }

  fn build_struct_from_row(row: &rusqlite::Row) -> Result<Self, rusqlite::Error> {
    let is_active_val: i64 = row.get(3)?;
    let is_beta_val: i64 = row.get(5)?;
    let show_library_val: i64 = row.get(6)?;
    Ok(Automation {
      id: Some(row.get(0)?),
      uuid: row.get(1)?,
      name: row.get(2)?,
      is_active: is_active_val != 0,
      description: row.get(4)?,
      is_beta: is_beta_val != 0,
      runs: None,
      trigger_cadences: None,
      trigger_data_sources: None,
      steps: None,
      show_library: show_library_val != 0,
      icon: row.get(7)?,
    })
  }

  pub fn find_by_message_id(message_id: u64) -> Result<Option<Automation>> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "
    SELECT automations.id, automations.uuid, automations.name, automations.is_active, automations.description, automation.is_beta, automation.show_library, automation.icon FROM automations
    LEFT JOIN automation_runs ON automation_runs.automation_uuid = automations.uuid
    LEFT JOIN messages ON automation_runs.thread_id = messages.thread_id
    WHERE messages.id = ?1",
    )?;
    let automation = stmt
      .query_row(params![message_id], |row| Automation::build_struct_from_row(row))
      .optional()?;
    Ok(automation)
  }

  pub fn find_by_ids() -> Result<Vec<Automation>> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare("SELECT id, uuid, name, is_active, description, is_beta, show_library, icon FROM automations")?;
    let rows = stmt.query_map(params![], |row| Automation::build_struct_from_row(row))?;
    let mut automations = Vec::new();
    for automation in rows {
      automations.push(automation?);
    }
    Ok(automations)
  }

  pub fn find_by_uuid(uuid: String) -> Result<Automation> {
    let connection = get_db_conn();
    let mut stmt = connection.prepare(
      "SELECT id, uuid, name, is_active, description, is_beta, show_library, icon  FROM automations WHERE uuid = ?1",
    )?;
    let automation = stmt.query_row(params![uuid], |row| Automation::build_struct_from_row(row))?;

    Ok(automation)
  }

  pub fn find_all() -> Vec<Automation> {
    let connection = get_db_conn();
    let mut stmt = connection
      .prepare(
        "
        SELECT
          automations.id as automation_id,
          automations.uuid as automation_uuid,
          automations.name as automation_name,
          automations.description as automation_description,
          automations.is_active as automation_is_active,
          automation_steps.id as step_id,
          automation_steps.name as step_name,
          automation_steps.ordering as step_ordering,
          automation_steps.args_json as step_args_json,
          cadence_triggers.id as cadence_id,
          cadence_triggers.cadence_type,
          cadence_triggers.day_of_week as cadence_day_of_week,
          cadence_triggers.time as cadence_time,
          automation_runs.id as run_id,
          automation_runs.schedule_timestamp as run_schedule_timestamp,
          automation_runs.execution_timestamp as run_execution_timestamp,
          automation_runs.thread_id as run_thread_id,
          automation_runs.user_id as run_user_id,
          automation_runs.run_params as run_run_params,
          automation_runs.feed_item_id as run_feed_item_id,
          data_source_trigger.id as trigger_data_source_id,
          data_source_trigger.data_source as trigger_data_source_data_source,
          data_source_trigger.offset_minutes as trigger_data_source_offset_minutes,
          automations.is_beta as automation_is_beta,
          automations.show_library as automation_show_library,
          automations.icon as automation_icon
        FROM automations
        LEFT JOIN automation_steps ON automation_steps.automation_uuid = automations.uuid
        LEFT JOIN cadence_triggers ON cadence_triggers.automation_uuid = automations.uuid
        LEFT JOIN automation_runs ON automation_runs.automation_uuid = automations.uuid
        LEFT JOIN data_source_trigger ON data_source_trigger.automation_uuid = automations.uuid
        ORDER BY automations.name, step_ordering",
      )
      .expect("could not prepare query get automations");
    let rows = stmt
      .query_map([], |row| {
        Ok((
          row.get::<_, u64>(0).unwrap(),             // automation_id
          row.get::<_, String>(1).unwrap(),          // automation_uuid
          row.get::<_, String>(2).unwrap(),          // automation_name
          row.get::<_, String>(3).unwrap(),          // automation_description
          row.get::<_, bool>(4).unwrap(),            // automation_is_active
          row.get::<_, Option<u64>>(5).unwrap(),     // step_id
          row.get::<_, Option<String>>(6).unwrap(),  // step_name
          row.get::<_, Option<u64>>(7).unwrap(),     // step_ordering
          row.get::<_, Option<String>>(8).unwrap(),  // step_args_json
          row.get::<_, Option<u64>>(9).unwrap(),     // cadence_id
          row.get::<_, Option<String>>(10).unwrap(), // cadence_type
          row.get::<_, Option<String>>(11).unwrap(), // cadence_day_of_week
          row.get::<_, Option<String>>(12).unwrap(), // cadence_time
          row.get::<_, Option<u64>>(13).unwrap(),    // run_id
          row.get::<_, Option<i64>>(14).unwrap(),    // run_schedule_timestamp
          row.get::<_, Option<i64>>(15).unwrap(),    // run_schedule_timestamp
          row.get::<_, Option<u64>>(16).unwrap(),    // run_thread_id
          row.get::<_, Option<u64>>(17).unwrap(),    // run_user_id
          row.get::<_, Option<String>>(18).unwrap(), // run_run_params
          row.get::<_, Option<u64>>(19).unwrap(),    // run_feed_item_id
          row.get::<_, Option<u64>>(20).unwrap(),    // trigger_data_source_id
          row.get::<_, Option<String>>(21).unwrap(), // trigger_data_source_data_source
          row.get::<_, Option<i64>>(22).unwrap(),    // trigger_data_source_offset_minutes
          row.get::<_, bool>(23).unwrap(),           // automation_is_beta
          row.get::<_, bool>(24).unwrap(),           // automation_show_library
          row.get::<_, String>(25).unwrap(), // automation_icon
        ))
      })
      .expect("Could not execute query");
    let mut automations: HashMap<u64, Automation> = HashMap::new();
    let mut steps: HashMap<u64, HashMap<u64, AutomationStep>> = HashMap::new();
    let mut cadences: HashMap<u64, HashMap<u64, CadenceTrigger>> = HashMap::new();
    let mut trigger_data_sources: HashMap<u64, HashMap<u64, DataSourceTrigger>> = HashMap::new();
    let mut runs: HashMap<u64, HashMap<u64, AutomationRun>> = HashMap::new();
    for row in rows {
      let (
        automation_id,
        automation_uuid,
        automation_name,
        automation_description,
        automation_is_active,
        step_id,
        step_name,
        step_ordering,
        step_args_json,
        cadence_id,
        cadence_type,
        cadence_day_of_week,
        cadence_time,
        run_id,
        run_schedule_timestamp,
        run_execution_timestamp,
        run_thread_id,
        run_user_id,
        run_run_params,
        run_feed_item_id,
        trigger_data_source_id,
        trigger_data_source_data_source,
        trigger_data_source_offset_minutes,
        automation_is_beta,
        automation_show_library,
        automation_icon,
      ) = row.unwrap();
      let automation = match automations.get(&automation_id) {
        Some(automation) => automation.clone(),
        None => Automation {
          id: Some(automation_id),
          uuid: automation_uuid.clone(),
          name: automation_name,
          description: automation_description,
          is_active: automation_is_active,
          is_beta: automation_is_beta,
          runs: None,
          trigger_cadences: None,
          trigger_data_sources: None,
          steps: None,
          show_library: automation_show_library,
          icon: automation_icon,
        },
      };
      automations.insert(automation_id.clone(), automation);
      if let Some(step_id) = step_id {
        let mut automation_steps = match steps.get(&automation_id) {
          Some(automation_steps) => automation_steps.clone(),
          None => HashMap::new(),
        };
        let step = AutomationStep {
          id: Some(step_id),
          automation_uuid: automation_uuid.clone(),
          name: step_name.unwrap(),
          ordering: step_ordering.unwrap(),
          args_json: step_args_json,
        };
        automation_steps.insert(step_id, step);
        steps.insert(automation_id.clone(), automation_steps);
      }
      if let Some(cadence_id) = cadence_id {
        let mut automation_cadences = match cadences.get(&automation_id) {
          Some(automation_cadences) => automation_cadences.clone(),
          None => HashMap::new(),
        };
        let cadence = CadenceTrigger {
          id: Some(cadence_id),
          automation_uuid: automation_uuid.clone(),
          cadence_type: cadence_type.unwrap(),
          day_of_week: cadence_day_of_week,
          time: cadence_time,
        };
        automation_cadences.insert(cadence_id, cadence);
        cadences.insert(automation_id.clone(), automation_cadences);
      }

      if let Some(trigger_data_source_id) = trigger_data_source_id {
        let mut data_source_trigger = match trigger_data_sources.get(&automation_id) {
          Some(data_source_trigger) => data_source_trigger.clone(),
          None => HashMap::new(),
        };
        let trigger_data_source = DataSourceTrigger {
          id: Some(trigger_data_source_id),
          automation_uuid: automation_uuid.clone(),
          data_source: trigger_data_source_data_source.unwrap(),
          offset_minutes: trigger_data_source_offset_minutes.unwrap_or(0),
        };
        data_source_trigger.insert(trigger_data_source_id, trigger_data_source);
        trigger_data_sources.insert(automation_id.clone(), data_source_trigger);
      }

      if let Some(run_id) = run_id {
        let mut automation_runs = match runs.get(&automation_id) {
          Some(automation_runs) => automation_runs.clone(),
          None => HashMap::new(),
        };

        let run = AutomationRun {
          id: Some(run_id),
          automation_uuid: automation_uuid.clone(),
          thread_id: run_thread_id,
          user_id: run_user_id.unwrap(),
          schedule_timestamp: run_schedule_timestamp,
          execution_timestamp: run_execution_timestamp,
          run_params: run_run_params,
          feed_item_id: run_feed_item_id,
        };

        automation_runs.insert(run_id, run);
        runs.insert(automation_id.clone(), automation_runs);
      }
    }
    automations
      .values()
      .into_iter()
      .map(|automation| Automation {
        id: automation.id.clone(),
        uuid: automation.uuid.clone(),
        name: automation.name.clone(),
        description: automation.description.clone(),
        is_active: automation.is_active,
        is_beta: automation.is_beta,
        show_library: automation.show_library,
        icon: automation.icon.clone(),
        runs: Some(
          runs
            .get(&automation.id.unwrap())
            .cloned()
            .unwrap_or(HashMap::new())
            .values()
            .cloned()
            .collect::<Vec<_>>(),
        ),
        trigger_cadences: Some(
          cadences
            .get(&automation.id.unwrap())
            .cloned()
            .unwrap_or(HashMap::new())
            .values()
            .cloned()
            .collect::<Vec<_>>(),
        ),
        trigger_data_sources: Some(
          trigger_data_sources
            .get(&automation.id.unwrap())
            .cloned()
            .unwrap_or(HashMap::new())
            .values()
            .cloned()
            .collect::<Vec<_>>(),
        ),
        steps: Some(
          steps
            .get(&automation.id.unwrap())
            .cloned()
            .unwrap_or(HashMap::new())
            .values()
            .cloned()
            .collect::<Vec<_>>(),
        ),
      })
      .collect::<Vec<Automation>>()
  }

  pub fn set_cadences(&mut self, cadences: Vec<CadenceTrigger>) {
    self.trigger_cadences = Some(cadences);
  }

  pub fn set_steps(&mut self, steps: Vec<AutomationStep>) {
    self.steps = Some(steps);
  }

  pub fn create(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    let existing_automation = Automation::find_by_uuid(self.uuid.clone());
    if let Ok(automation) = existing_automation {
      self.id = automation.id;
      return Ok(());
    }

    connection
            .execute(
                "INSERT INTO automations (uuid, name, description, is_active, is_beta, show_library, icon) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) ON CONFLICT(uuid) DO UPDATE SET name = ?2, description = ?3, is_active = ?4, is_beta = ?5",
                (&self.uuid, &self.name, &self.description, &self.is_active, &self.is_beta,&self.show_library, &self.icon),
            )
            .expect("Could not insert automation");
    if self.id.is_none() {
      self.id = Some(connection.last_insert_rowid() as u64);
    }

    if let Some(ref mut cadences) = self.trigger_cadences {
      connection.execute(
        "DELETE FROM cadence_triggers WHERE automation_uuid = ?1",
        [&self.uuid],
      );
      for cadence in cadences {
        cadence.create()?;
      }
    }

    if let Some(ref mut trigger_data_sources) = self.trigger_data_sources {
      connection.execute(
        "DELETE FROM data_source_trigger WHERE automation_uuid = ?1",
        [&self.uuid],
      );
      for trigger_data_source in trigger_data_sources {
        trigger_data_source.create()?;
      }
    }
    connection.execute(
      "DELETE FROM automation_steps WHERE automation_uuid = ?1",
      [&self.uuid],
    );
    if let Some(ref mut steps) = self.steps {
      for step in steps {
        step.create()?;
      }
    }
    Ok(())
  }

  pub fn delete(&mut self) {
    let connection = get_db_conn();
    connection
      .execute("DELETE FROM automations WHERE id = ?1", [&self.id])
      .expect("Could not delete automation");

    connection.execute(
      "DELETE FROM cadence_triggers WHERE automation_uuid = ?1",
      [&self.id],
    );

    connection.execute(
      "DELETE FROM data_source_trigger WHERE automation_uuid = ?1",
      [&self.id],
    );

    connection.execute(
      "DELETE FROM automation_steps WHERE automation_uuid = ?1",
      [&self.id],
    );
  }

  pub fn update(&mut self) -> Result<(), Error> {
    let connection = get_db_conn();
    println!(
      "----------- IS ACTIVE: {:?} -----------",
      (&self.name, &self.description, &self.id, &self.is_active,)
    );
    connection
      .execute(
        "UPDATE automations SET name = ?1, description = ?2, is_active = ?3 WHERE id = ?4",
        (&self.name, &self.description, &self.is_active, &self.id),
      )
      .expect("Could not update automation");

    if let Some(ref trigger_cadences) = self.trigger_cadences {
      connection.execute(
        "DELETE FROM cadence_triggers WHERE automation_uuid = ?1",
        [&self.uuid],
      );
      for cadence in trigger_cadences {
        connection
                    .execute(
                        "INSERT INTO cadence_triggers (cadence_type, day_of_week, time, automation_uuid) VALUES (?1, ?2, ?3, ?4)",
                        (&cadence.cadence_type, &cadence.day_of_week, &cadence.time, &self.uuid)
                    )
                    .expect("Could not insert cadence");
      }
    }
    if let Some(ref trigger_data_sources) = self.trigger_data_sources {
      connection.execute(
        "DELETE FROM data_source_trigger WHERE automation_uuid = ?1",
        [&self.uuid],
      );
      for trigger_data_source in trigger_data_sources {
        connection
          .execute(
            "INSERT INTO data_source_trigger (offset_minutes, automation_uuid) VALUES (?1, ?2)",
            (&trigger_data_source.offset_minutes, &self.uuid),
          )
          .expect("Could not insert cadence");
      }
    }
    connection.execute(
      "DELETE FROM automation_steps WHERE automation_uuid = ?1",
      [&self.uuid],
    );
    if let Some(ref steps) = self.steps {
      for step in steps {
        connection
                    .execute(
                        "INSERT INTO automation_steps (name, ordering, args_json, automation_uuid) VALUES (?1, ?2, ?3, ?4)",
                        (&step.name, &step.ordering, &step.args_json, &self.uuid)
                    )
                    .expect("Could not insert automation step");
      }
    }
    Ok(())
  }
}
