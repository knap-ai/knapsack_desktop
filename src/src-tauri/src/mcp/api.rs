use actix_web::{get, post, put, web, HttpResponse};
use serde::Deserialize;
use serde_json::json;

use crate::db::models::mcp_server::{McpServer, NewMcpServer};

/// Allowlist of executables that custom MCP servers may use.
const ALLOWED_COMMANDS: &[&str] = &["npx", "node", "python", "python3", "uvx", "docker"];

/// Validate that a package name is a valid npm-scoped or unscoped package.
/// Accepts `@scope/name` or `name`, with alphanumeric, hyphens, dots, underscores.
fn is_valid_npm_package(name: &str) -> bool {
    let re = regex::Regex::new(r"^(@[a-zA-Z0-9_-]+/)?[a-zA-Z0-9][a-zA-Z0-9._-]*$").unwrap();
    re.is_match(name)
}

/// Validate that a command is in the allowlist.
fn is_allowed_command(command: &str) -> bool {
    ALLOWED_COMMANDS.contains(&command)
}

#[derive(Deserialize)]
pub struct ServersQuery {
    category: Option<String>,
}

/// GET /api/knapsack/mcp/servers
/// List all MCP servers, optionally filtered by category.
#[get("/api/knapsack/mcp/servers")]
pub async fn list_servers(query: web::Query<ServersQuery>) -> HttpResponse {
    let result = if let Some(ref category) = query.category {
        McpServer::get_servers_by_category(category)
    } else {
        McpServer::get_all_servers()
    };

    match result {
        Ok(servers) => HttpResponse::Ok().json(json!({
            "success": true,
            "data": servers,
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to fetch MCP servers: {:?}", e),
        })),
    }
}

/// GET /api/knapsack/mcp/servers/installed
/// List only installed and enabled MCP servers.
#[get("/api/knapsack/mcp/servers/installed")]
pub async fn list_installed_servers() -> HttpResponse {
    match McpServer::get_installed_servers() {
        Ok(servers) => HttpResponse::Ok().json(json!({
            "success": true,
            "data": servers,
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to fetch installed MCP servers: {:?}", e),
        })),
    }
}

/// GET /api/knapsack/mcp/servers/{uuid}
/// Get a single MCP server by UUID.
#[get("/api/knapsack/mcp/servers/{uuid}")]
pub async fn get_server(path: web::Path<String>) -> HttpResponse {
    let uuid = path.into_inner();
    match McpServer::get_server_by_uuid(&uuid) {
        Ok(Some(server)) => HttpResponse::Ok().json(json!({
            "success": true,
            "data": server,
        })),
        Ok(None) => HttpResponse::NotFound().json(json!({
            "success": false,
            "message": "MCP server not found",
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to fetch MCP server: {:?}", e),
        })),
    }
}

/// POST /api/knapsack/mcp/servers/{uuid}/install
/// Install an MCP server (mark as installed, optionally run npx install).
#[post("/api/knapsack/mcp/servers/{uuid}/install")]
pub async fn install_server(path: web::Path<String>) -> HttpResponse {
    let uuid = path.into_inner();

    // Verify the server exists
    let server = match McpServer::get_server_by_uuid(&uuid) {
        Ok(Some(s)) => s,
        Ok(None) => {
            return HttpResponse::NotFound().json(json!({
                "success": false,
                "message": "MCP server not found",
            }))
        }
        Err(e) => {
            return HttpResponse::InternalServerError().json(json!({
                "success": false,
                "message": format!("Failed to look up MCP server: {:?}", e),
            }))
        }
    };

    // Attempt to pre-install the npm package via npx (async, non-blocking)
    if server.command == "npx" {
        if let Some(ref args_json) = server.args {
            if let Ok(args) = serde_json::from_str::<Vec<String>>(args_json) {
                if let Some(package_name) = args.first() {
                    // Validate package name before passing to npm
                    if !is_valid_npm_package(package_name) {
                        return HttpResponse::BadRequest().json(json!({
                            "success": false,
                            "message": format!(
                                "Invalid npm package name: '{}'. Must match @scope/name or name pattern.",
                                package_name
                            ),
                        }));
                    }

                    // Use tokio::process::Command to avoid blocking the actix thread
                    let mut npm_cmd = tokio::process::Command::new("npm");
                    npm_cmd.args(&["install", "-g", package_name]);
                    #[cfg(windows)]
                    {
                        use std::os::windows::process::CommandExt;
                        const CREATE_NO_WINDOW: u32 = 0x08000000;
                        npm_cmd.creation_flags(CREATE_NO_WINDOW);
                    }
                    let install_result = npm_cmd.output().await;

                    match install_result {
                        Ok(output) => {
                            if !output.status.success() {
                                log::warn!(
                                    "[mcp] npm install for {} returned non-zero: {}",
                                    package_name,
                                    String::from_utf8_lossy(&output.stderr)
                                );
                                // We proceed anyway -- npx can download on-demand
                            }
                        }
                        Err(e) => {
                            log::warn!("[mcp] npm install failed for {}: {}", package_name, e);
                            // Non-fatal: npx can still work without a global install
                        }
                    }
                }
            }
        }
    }

    match McpServer::install_server(&uuid) {
        Ok(()) => {
            let updated = McpServer::get_server_by_uuid(&uuid).ok().flatten();
            HttpResponse::Ok().json(json!({
                "success": true,
                "data": updated,
            }))
        }
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to install MCP server: {:?}", e),
        })),
    }
}

/// POST /api/knapsack/mcp/servers/{uuid}/uninstall
/// Uninstall an MCP server.
#[post("/api/knapsack/mcp/servers/{uuid}/uninstall")]
pub async fn uninstall_server(path: web::Path<String>) -> HttpResponse {
    let uuid = path.into_inner();

    match McpServer::uninstall_server(&uuid) {
        Ok(()) => {
            let updated = McpServer::get_server_by_uuid(&uuid).ok().flatten();
            HttpResponse::Ok().json(json!({
                "success": true,
                "data": updated,
            }))
        }
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to uninstall MCP server: {:?}", e),
        })),
    }
}

/// POST /api/knapsack/mcp/servers/{uuid}/enable
/// Enable an installed MCP server.
#[post("/api/knapsack/mcp/servers/{uuid}/enable")]
pub async fn enable_server(path: web::Path<String>) -> HttpResponse {
    let uuid = path.into_inner();

    match McpServer::enable_server(&uuid) {
        Ok(()) => {
            let updated = McpServer::get_server_by_uuid(&uuid).ok().flatten();
            HttpResponse::Ok().json(json!({
                "success": true,
                "data": updated,
            }))
        }
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to enable MCP server: {:?}", e),
        })),
    }
}

/// POST /api/knapsack/mcp/servers/{uuid}/disable
/// Disable an MCP server.
#[post("/api/knapsack/mcp/servers/{uuid}/disable")]
pub async fn disable_server(path: web::Path<String>) -> HttpResponse {
    let uuid = path.into_inner();

    match McpServer::disable_server(&uuid) {
        Ok(()) => {
            let updated = McpServer::get_server_by_uuid(&uuid).ok().flatten();
            HttpResponse::Ok().json(json!({
                "success": true,
                "data": updated,
            }))
        }
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to disable MCP server: {:?}", e),
        })),
    }
}

#[derive(Deserialize)]
pub struct UpdateConfigBody {
    config_json: String,
}

/// PUT /api/knapsack/mcp/servers/{uuid}/config
/// Update server configuration (env vars, args stored as JSON).
#[put("/api/knapsack/mcp/servers/{uuid}/config")]
pub async fn update_server_config(
    path: web::Path<String>,
    body: web::Json<UpdateConfigBody>,
) -> HttpResponse {
    let uuid = path.into_inner();

    // Validate that the config_json is actually valid JSON before storing
    if serde_json::from_str::<serde_json::Value>(&body.config_json).is_err() {
        return HttpResponse::BadRequest().json(json!({
            "success": false,
            "message": "config_json must be valid JSON",
        }));
    }

    match McpServer::update_server_config(&uuid, &body.config_json) {
        Ok(()) => {
            let updated = McpServer::get_server_by_uuid(&uuid).ok().flatten();
            HttpResponse::Ok().json(json!({
                "success": true,
                "data": updated,
            }))
        }
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to update MCP server config: {:?}", e),
        })),
    }
}

/// POST /api/knapsack/mcp/servers/custom
/// Add a custom MCP server.
#[post("/api/knapsack/mcp/servers/custom")]
pub async fn add_custom_server(body: web::Json<NewMcpServer>) -> HttpResponse {
    let server = body.into_inner();

    // Validate that the command is in the allowlist
    if !is_allowed_command(&server.command) {
        return HttpResponse::BadRequest().json(json!({
            "success": false,
            "message": format!(
                "Command '{}' is not allowed. Allowed commands: {}",
                server.command,
                ALLOWED_COMMANDS.join(", ")
            ),
        }));
    }

    // Validate config_json if provided
    if let Some(ref config) = server.config_json {
        if serde_json::from_str::<serde_json::Value>(config).is_err() {
            return HttpResponse::BadRequest().json(json!({
                "success": false,
                "message": "config_json must be valid JSON",
            }));
        }
    }

    match McpServer::add_custom_server(&server) {
        Ok(created) => HttpResponse::Ok().json(json!({
            "success": true,
            "data": created,
        })),
        Err(e) => HttpResponse::InternalServerError().json(json!({
            "success": false,
            "message": format!("Failed to add custom MCP server: {:?}", e),
        })),
    }
}
