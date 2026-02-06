use rusqlite::{params, Result};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::db::db::get_db_conn;
use crate::error::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenUsage {
    pub id: Option<u64>,
    pub provider: String,
    pub model: String,
    pub input_tokens: i64,
    pub output_tokens: i64,
    pub cost_usd: f64,
    pub request_type: String,
    pub timestamp: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageSummary {
    pub provider: String,
    pub model: String,
    pub total_input_tokens: i64,
    pub total_output_tokens: i64,
    pub total_cost_usd: f64,
    pub request_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyUsage {
    pub date: String,
    pub total_input_tokens: i64,
    pub total_output_tokens: i64,
    pub total_cost_usd: f64,
    pub request_count: i64,
}

impl TokenUsage {
    pub fn new(
        provider: String,
        model: String,
        input_tokens: i64,
        output_tokens: i64,
        cost_usd: f64,
        request_type: String,
    ) -> Self {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        TokenUsage {
            id: None,
            provider,
            model,
            input_tokens,
            output_tokens,
            cost_usd,
            request_type,
            timestamp: now,
        }
    }

    pub fn create(&mut self) -> Result<(), Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "INSERT INTO token_usage (provider, model, input_tokens, output_tokens, cost_usd, request_type, timestamp) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        )?;
        stmt.execute(params![
            self.provider,
            self.model,
            self.input_tokens,
            self.output_tokens,
            self.cost_usd,
            self.request_type,
            self.timestamp,
        ])?;
        self.id = Some(connection.last_insert_rowid() as u64);
        Ok(())
    }

    /// Get usage summary grouped by provider and model for a given time range.
    pub fn summary_since(since_timestamp: i64) -> Result<Vec<UsageSummary>, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT provider, model, SUM(input_tokens), SUM(output_tokens), SUM(cost_usd), COUNT(*)
             FROM token_usage
             WHERE timestamp >= ?1
             GROUP BY provider, model
             ORDER BY SUM(cost_usd) DESC",
        )?;
        let rows = stmt.query_map([since_timestamp], |row| {
            Ok(UsageSummary {
                provider: row.get(0)?,
                model: row.get(1)?,
                total_input_tokens: row.get(2)?,
                total_output_tokens: row.get(3)?,
                total_cost_usd: row.get(4)?,
                request_count: row.get(5)?,
            })
        })?;

        let mut results = Vec::new();
        for row in rows {
            results.push(row?);
        }
        Ok(results)
    }

    /// Get daily usage breakdown for the last N days.
    pub fn daily_usage(days: i64) -> Result<Vec<DailyUsage>, Error> {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let since = now - (days * 86400);
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT date(timestamp, 'unixepoch', 'localtime') as day,
                    SUM(input_tokens), SUM(output_tokens), SUM(cost_usd), COUNT(*)
             FROM token_usage
             WHERE timestamp >= ?1
             GROUP BY day
             ORDER BY day ASC",
        )?;
        let rows = stmt.query_map([since], |row| {
            Ok(DailyUsage {
                date: row.get(0)?,
                total_input_tokens: row.get(1)?,
                total_output_tokens: row.get(2)?,
                total_cost_usd: row.get(3)?,
                request_count: row.get(4)?,
            })
        })?;

        let mut results = Vec::new();
        for row in rows {
            results.push(row?);
        }
        Ok(results)
    }

    /// Get total cost since a given timestamp.
    pub fn total_cost_since(since_timestamp: i64) -> Result<f64, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT COALESCE(SUM(cost_usd), 0.0) FROM token_usage WHERE timestamp >= ?1",
        )?;
        let total: f64 = stmt.query_row([since_timestamp], |row| row.get(0))?;
        Ok(total)
    }

    /// Get recent usage records (for display).
    pub fn recent(limit: i64) -> Result<Vec<TokenUsage>, Error> {
        let connection = get_db_conn();
        let mut stmt = connection.prepare(
            "SELECT id, provider, model, input_tokens, output_tokens, cost_usd, request_type, timestamp
             FROM token_usage
             ORDER BY timestamp DESC
             LIMIT ?1",
        )?;
        let rows = stmt.query_map([limit], |row| {
            Ok(TokenUsage {
                id: Some(row.get(0)?),
                provider: row.get(1)?,
                model: row.get(2)?,
                input_tokens: row.get(3)?,
                output_tokens: row.get(4)?,
                cost_usd: row.get(5)?,
                request_type: row.get(6)?,
                timestamp: row.get(7)?,
            })
        })?;

        let mut results = Vec::new();
        for row in rows {
            results.push(row?);
        }
        Ok(results)
    }
}
