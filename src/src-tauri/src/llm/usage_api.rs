use actix_web::{get, web, HttpResponse};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::db::models::token_usage::TokenUsage;

#[derive(Deserialize)]
pub struct UsageQuery {
    /// Number of days to look back (default: 30)
    days: Option<i64>,
}

#[derive(Deserialize)]
pub struct RecentQuery {
    /// Number of recent records to return (default: 50)
    limit: Option<i64>,
}

/// GET /api/knapsack/token_usage/summary
/// Returns usage summary grouped by provider/model for the given time period.
#[get("/api/knapsack/token_usage/summary")]
pub async fn get_usage_summary(query: web::Query<UsageQuery>) -> HttpResponse {
    let days = query.days.unwrap_or(30);
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;
    let since = now - (days * 86400);

    match TokenUsage::summary_since(since) {
        Ok(summary) => {
            let total_cost: f64 = summary.iter().map(|s| s.total_cost_usd).sum();
            let total_requests: i64 = summary.iter().map(|s| s.request_count).sum();
            let total_input: i64 = summary.iter().map(|s| s.total_input_tokens).sum();
            let total_output: i64 = summary.iter().map(|s| s.total_output_tokens).sum();

            HttpResponse::Ok().json(json!({
                "success": true,
                "days": days,
                "totalCostUsd": total_cost,
                "totalRequests": total_requests,
                "totalInputTokens": total_input,
                "totalOutputTokens": total_output,
                "byModel": summary,
            }))
        }
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to fetch usage summary: {}", e),
        })),
    }
}

/// GET /api/knapsack/token_usage/daily
/// Returns daily breakdown of usage for charting.
#[get("/api/knapsack/token_usage/daily")]
pub async fn get_daily_usage(query: web::Query<UsageQuery>) -> HttpResponse {
    let days = query.days.unwrap_or(30);

    match TokenUsage::daily_usage(days) {
        Ok(daily) => HttpResponse::Ok().json(json!({
            "success": true,
            "days": days,
            "daily": daily,
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to fetch daily usage: {}", e),
        })),
    }
}

/// GET /api/knapsack/token_usage/recent
/// Returns recent individual usage records.
#[get("/api/knapsack/token_usage/recent")]
pub async fn get_recent_usage(query: web::Query<RecentQuery>) -> HttpResponse {
    let limit = query.limit.unwrap_or(50);

    match TokenUsage::recent(limit) {
        Ok(records) => HttpResponse::Ok().json(json!({
            "success": true,
            "records": records,
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to fetch recent usage: {}", e),
        })),
    }
}

/// GET /api/knapsack/token_usage/budget_status
/// Returns current spend vs budget limits.
/// Budget settings are stored client-side (localStorage); we just compute the spend totals here.
#[get("/api/knapsack/token_usage/budget_status")]
pub async fn get_budget_status() -> HttpResponse {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    // Start of today (UTC)
    let start_of_day = now - (now % 86400);
    // Start of month (approx: 30 days ago from now)
    let start_of_month = now - (30 * 86400);

    let daily_cost = TokenUsage::total_cost_since(start_of_day).unwrap_or(0.0);
    let monthly_cost = TokenUsage::total_cost_since(start_of_month).unwrap_or(0.0);

    HttpResponse::Ok().json(json!({
        "success": true,
        "dailyCostUsd": daily_cost,
        "monthlyCostUsd": monthly_cost,
    }))
}
