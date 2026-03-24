export declare const GENERATED_BUNDLED_PLUGIN_METADATA: readonly [{
    readonly dirName: "acpx";
    readonly idHint: "acpx";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/acpx";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw ACP runtime backend via acpx";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "acpx";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly command: {
                    readonly type: "string";
                };
                readonly expectedVersion: {
                    readonly type: "string";
                };
                readonly cwd: {
                    readonly type: "string";
                };
                readonly permissionMode: {
                    readonly type: "string";
                    readonly enum: readonly ["approve-all", "approve-reads", "deny-all"];
                };
                readonly nonInteractivePermissions: {
                    readonly type: "string";
                    readonly enum: readonly ["deny", "fail"];
                };
                readonly strictWindowsCmdWrapper: {
                    readonly type: "boolean";
                };
                readonly timeoutSeconds: {
                    readonly type: "number";
                    readonly minimum: 0.001;
                };
                readonly queueOwnerTtlSeconds: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
                readonly mcpServers: {
                    readonly type: "object";
                    readonly additionalProperties: {
                        readonly type: "object";
                        readonly properties: {
                            readonly command: {
                                readonly type: "string";
                                readonly description: "Command to run the MCP server";
                            };
                            readonly args: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                                readonly description: "Arguments to pass to the command";
                            };
                            readonly env: {
                                readonly type: "object";
                                readonly additionalProperties: {
                                    readonly type: "string";
                                };
                                readonly description: "Environment variables for the MCP server";
                            };
                        };
                        readonly required: readonly ["command"];
                    };
                };
            };
        };
        readonly skills: readonly ["./skills"];
        readonly name: "ACPX Runtime";
        readonly description: "ACP runtime backend powered by acpx with configurable command path and version policy.";
        readonly uiHints: {
            readonly command: {
                readonly label: "acpx Command";
                readonly help: "Optional path/command override for acpx (for example /home/user/repos/acpx/dist/cli.js). Leave unset to use plugin-local bundled acpx.";
            };
            readonly expectedVersion: {
                readonly label: "Expected acpx Version";
                readonly help: "Exact version to enforce or \"any\" to skip strict version matching.";
            };
            readonly cwd: {
                readonly label: "Default Working Directory";
                readonly help: "Default cwd for ACP session operations when not set per session.";
            };
            readonly permissionMode: {
                readonly label: "Permission Mode";
                readonly help: "Default acpx permission policy for runtime prompts.";
            };
            readonly nonInteractivePermissions: {
                readonly label: "Non-Interactive Permission Policy";
                readonly help: "acpx policy when interactive permission prompts are unavailable.";
            };
            readonly strictWindowsCmdWrapper: {
                readonly label: "Strict Windows cmd Wrapper";
                readonly help: "Enabled by default. On Windows, reject unresolved .cmd/.bat wrappers instead of shell fallback. Disable only for compatibility with non-standard wrappers.";
                readonly advanced: true;
            };
            readonly timeoutSeconds: {
                readonly label: "Prompt Timeout Seconds";
                readonly help: "Optional acpx timeout for each runtime turn.";
                readonly advanced: true;
            };
            readonly queueOwnerTtlSeconds: {
                readonly label: "Queue Owner TTL Seconds";
                readonly help: "Idle queue-owner TTL for acpx prompt turns. Keep this short in OpenClaw to avoid delayed completion after each turn.";
                readonly advanced: true;
            };
            readonly mcpServers: {
                readonly label: "MCP Servers";
                readonly help: "Named MCP server definitions to inject into ACPX-backed session bootstrap. Each entry needs a command and can include args and env.";
                readonly advanced: true;
            };
        };
    };
}, {
    readonly dirName: "amazon-bedrock";
    readonly idHint: "amazon-bedrock";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/amazon-bedrock-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Amazon Bedrock provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "amazon-bedrock";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["amazon-bedrock"];
    };
}, {
    readonly dirName: "anthropic";
    readonly idHint: "anthropic";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/anthropic-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Anthropic provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "anthropic";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["anthropic"];
        readonly providerAuthEnvVars: {
            readonly anthropic: readonly ["ANTHROPIC_OAUTH_TOKEN", "ANTHROPIC_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "anthropic";
            readonly method: "setup-token";
            readonly choiceId: "token";
            readonly choiceLabel: "Anthropic token (paste setup-token)";
            readonly choiceHint: "Run `claude setup-token` elsewhere, then paste the token here";
            readonly groupId: "anthropic";
            readonly groupLabel: "Anthropic";
            readonly groupHint: "setup-token + API key";
        }, {
            readonly provider: "anthropic";
            readonly method: "api-key";
            readonly choiceId: "apiKey";
            readonly choiceLabel: "Anthropic API key";
            readonly groupId: "anthropic";
            readonly groupLabel: "Anthropic";
            readonly groupHint: "setup-token + API key";
            readonly optionKey: "anthropicApiKey";
            readonly cliFlag: "--anthropic-api-key";
            readonly cliOption: "--anthropic-api-key <key>";
            readonly cliDescription: "Anthropic API key";
        }];
    };
}, {
    readonly dirName: "bluebubbles";
    readonly idHint: "bluebubbles";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/bluebubbles";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw BlueBubbles channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "bluebubbles";
            readonly label: "BlueBubbles";
            readonly selectionLabel: "BlueBubbles (macOS app)";
            readonly detailLabel: "BlueBubbles";
            readonly docsPath: "/channels/bluebubbles";
            readonly docsLabel: "bluebubbles";
            readonly blurb: "iMessage via the BlueBubbles mac app + REST API.";
            readonly aliases: readonly ["bb"];
            readonly preferOver: readonly ["imessage"];
            readonly systemImage: "bubble.left.and.text.bubble.right";
            readonly order: 75;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/bluebubbles";
            readonly localPath: "extensions/bluebubbles";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "bluebubbles";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["bluebubbles"];
    };
}, {
    readonly dirName: "brave";
    readonly idHint: "brave-plugin";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/brave-plugin";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Brave plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "brave";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly webSearch: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly apiKey: {
                            readonly type: readonly ["string", "object"];
                        };
                        readonly mode: {
                            readonly type: "string";
                            readonly enum: readonly ["web", "llm-context"];
                        };
                    };
                };
            };
        };
        readonly providerAuthEnvVars: {
            readonly brave: readonly ["BRAVE_API_KEY"];
        };
        readonly uiHints: {
            readonly "webSearch.apiKey": {
                readonly label: "Brave Search API Key";
                readonly help: "Brave Search API key (fallback: BRAVE_API_KEY env var).";
                readonly sensitive: true;
                readonly placeholder: "BSA...";
            };
            readonly "webSearch.mode": {
                readonly label: "Brave Search Mode";
                readonly help: "Brave Search mode: web or llm-context.";
            };
        };
    };
}, {
    readonly dirName: "byteplus";
    readonly idHint: "byteplus";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/byteplus-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw BytePlus provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "byteplus";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["byteplus", "byteplus-plan"];
        readonly providerAuthEnvVars: {
            readonly byteplus: readonly ["BYTEPLUS_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "byteplus";
            readonly method: "api-key";
            readonly choiceId: "byteplus-api-key";
            readonly choiceLabel: "BytePlus API key";
            readonly groupId: "byteplus";
            readonly groupLabel: "BytePlus";
            readonly groupHint: "API key";
            readonly optionKey: "byteplusApiKey";
            readonly cliFlag: "--byteplus-api-key";
            readonly cliOption: "--byteplus-api-key <key>";
            readonly cliDescription: "BytePlus API key";
        }];
    };
}, {
    readonly dirName: "chutes";
    readonly idHint: "chutes";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/chutes-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Chutes.ai provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "chutes";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly enabledByDefault: true;
        readonly providers: readonly ["chutes"];
        readonly providerAuthEnvVars: {
            readonly chutes: readonly ["CHUTES_API_KEY", "CHUTES_OAUTH_TOKEN"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "chutes";
            readonly method: "oauth";
            readonly choiceId: "chutes";
            readonly choiceLabel: "Chutes (OAuth)";
            readonly choiceHint: "Browser sign-in";
            readonly groupId: "chutes";
            readonly groupLabel: "Chutes";
            readonly groupHint: "OAuth + API key";
        }, {
            readonly provider: "chutes";
            readonly method: "api-key";
            readonly choiceId: "chutes-api-key";
            readonly choiceLabel: "Chutes API key";
            readonly choiceHint: "Open-source models including Llama, DeepSeek, and more";
            readonly groupId: "chutes";
            readonly groupLabel: "Chutes";
            readonly groupHint: "OAuth + API key";
            readonly optionKey: "chutesApiKey";
            readonly cliFlag: "--chutes-api-key";
            readonly cliOption: "--chutes-api-key <key>";
            readonly cliDescription: "Chutes API key";
        }];
    };
}, {
    readonly dirName: "cloudflare-ai-gateway";
    readonly idHint: "cloudflare-ai-gateway";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/cloudflare-ai-gateway-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Cloudflare AI Gateway provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "cloudflare-ai-gateway";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["cloudflare-ai-gateway"];
        readonly providerAuthEnvVars: {
            readonly "cloudflare-ai-gateway": readonly ["CLOUDFLARE_AI_GATEWAY_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "cloudflare-ai-gateway";
            readonly method: "api-key";
            readonly choiceId: "cloudflare-ai-gateway-api-key";
            readonly choiceLabel: "Cloudflare AI Gateway";
            readonly choiceHint: "Account ID + Gateway ID + API key";
            readonly groupId: "cloudflare-ai-gateway";
            readonly groupLabel: "Cloudflare AI Gateway";
            readonly groupHint: "Account ID + Gateway ID + API key";
            readonly optionKey: "cloudflareAiGatewayApiKey";
            readonly cliFlag: "--cloudflare-ai-gateway-api-key";
            readonly cliOption: "--cloudflare-ai-gateway-api-key <key>";
            readonly cliDescription: "Cloudflare AI Gateway API key";
        }];
    };
}, {
    readonly dirName: "copilot-proxy";
    readonly idHint: "copilot-proxy";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/copilot-proxy";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Copilot Proxy provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "copilot-proxy";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["copilot-proxy"];
        readonly providerAuthChoices: readonly [{
            readonly provider: "copilot-proxy";
            readonly method: "local";
            readonly choiceId: "copilot-proxy";
            readonly choiceLabel: "Copilot Proxy";
            readonly choiceHint: "Configure base URL + model ids";
            readonly groupId: "copilot";
            readonly groupLabel: "Copilot";
            readonly groupHint: "GitHub + local proxy";
        }];
    };
}, {
    readonly dirName: "deepgram";
    readonly idHint: "deepgram";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/deepgram-provider";
    readonly packageVersion: "2026.3.14";
    readonly packageDescription: "OpenClaw Deepgram media-understanding provider";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "deepgram";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
    };
}, {
    readonly dirName: "deepseek";
    readonly idHint: "deepseek";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/deepseek-provider";
    readonly packageVersion: "2026.3.14";
    readonly packageDescription: "OpenClaw DeepSeek provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "deepseek";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["deepseek"];
        readonly providerAuthEnvVars: {
            readonly deepseek: readonly ["DEEPSEEK_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "deepseek";
            readonly method: "api-key";
            readonly choiceId: "deepseek-api-key";
            readonly choiceLabel: "DeepSeek API key";
            readonly groupId: "deepseek";
            readonly groupLabel: "DeepSeek";
            readonly groupHint: "API key";
            readonly optionKey: "deepseekApiKey";
            readonly cliFlag: "--deepseek-api-key";
            readonly cliOption: "--deepseek-api-key <key>";
            readonly cliDescription: "DeepSeek API key";
        }];
    };
}, {
    readonly dirName: "diagnostics-otel";
    readonly idHint: "diagnostics-otel";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/diagnostics-otel";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw diagnostics OpenTelemetry exporter";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "diagnostics-otel";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
    };
}, {
    readonly dirName: "diffs";
    readonly idHint: "diffs";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/diffs";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw diff viewer plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "diffs";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly defaults: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly fontFamily: {
                            readonly type: "string";
                            readonly default: "Fira Code";
                        };
                        readonly fontSize: {
                            readonly type: "number";
                            readonly minimum: 10;
                            readonly maximum: 24;
                            readonly default: 15;
                        };
                        readonly lineSpacing: {
                            readonly type: "number";
                            readonly minimum: 1;
                            readonly maximum: 3;
                            readonly default: 1.6;
                        };
                        readonly layout: {
                            readonly type: "string";
                            readonly enum: readonly ["unified", "split"];
                            readonly default: "unified";
                        };
                        readonly showLineNumbers: {
                            readonly type: "boolean";
                            readonly default: true;
                        };
                        readonly diffIndicators: {
                            readonly type: "string";
                            readonly enum: readonly ["bars", "classic", "none"];
                            readonly default: "bars";
                        };
                        readonly wordWrap: {
                            readonly type: "boolean";
                            readonly default: true;
                        };
                        readonly background: {
                            readonly type: "boolean";
                            readonly default: true;
                        };
                        readonly theme: {
                            readonly type: "string";
                            readonly enum: readonly ["light", "dark"];
                            readonly default: "dark";
                        };
                        readonly fileFormat: {
                            readonly type: "string";
                            readonly enum: readonly ["png", "pdf"];
                            readonly default: "png";
                        };
                        readonly format: {
                            readonly type: "string";
                            readonly enum: readonly ["png", "pdf"];
                        };
                        readonly fileQuality: {
                            readonly type: "string";
                            readonly enum: readonly ["standard", "hq", "print"];
                            readonly default: "standard";
                        };
                        readonly fileScale: {
                            readonly type: "number";
                            readonly minimum: 1;
                            readonly maximum: 4;
                            readonly default: 2;
                        };
                        readonly fileMaxWidth: {
                            readonly type: "number";
                            readonly minimum: 640;
                            readonly maximum: 2400;
                            readonly default: 960;
                        };
                        readonly imageFormat: {
                            readonly type: "string";
                            readonly enum: readonly ["png", "pdf"];
                        };
                        readonly imageQuality: {
                            readonly type: "string";
                            readonly enum: readonly ["standard", "hq", "print"];
                        };
                        readonly imageScale: {
                            readonly type: "number";
                            readonly minimum: 1;
                            readonly maximum: 4;
                        };
                        readonly imageMaxWidth: {
                            readonly type: "number";
                            readonly minimum: 640;
                            readonly maximum: 2400;
                        };
                        readonly mode: {
                            readonly type: "string";
                            readonly enum: readonly ["view", "image", "file", "both"];
                            readonly default: "both";
                        };
                    };
                };
                readonly security: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly allowRemoteViewer: {
                            readonly type: "boolean";
                            readonly default: false;
                        };
                    };
                };
            };
        };
        readonly skills: readonly ["./skills"];
        readonly name: "Diffs";
        readonly description: "Read-only diff viewer and file renderer for agents.";
        readonly uiHints: {
            readonly "defaults.fontFamily": {
                readonly label: "Default Font";
                readonly help: "Preferred font family name for diff content and headers.";
            };
            readonly "defaults.fontSize": {
                readonly label: "Default Font Size";
                readonly help: "Base diff font size in pixels.";
            };
            readonly "defaults.lineSpacing": {
                readonly label: "Default Line Spacing";
                readonly help: "Line-height multiplier applied to diff rows.";
            };
            readonly "defaults.layout": {
                readonly label: "Default Layout";
                readonly help: "Initial diff layout shown in the viewer.";
            };
            readonly "defaults.showLineNumbers": {
                readonly label: "Show Line Numbers";
                readonly help: "Show line numbers by default.";
            };
            readonly "defaults.diffIndicators": {
                readonly label: "Diff Indicator Style";
                readonly help: "Choose added/removed indicators style.";
            };
            readonly "defaults.wordWrap": {
                readonly label: "Default Word Wrap";
                readonly help: "Wrap long lines by default.";
            };
            readonly "defaults.background": {
                readonly label: "Default Background Highlights";
                readonly help: "Show added/removed background highlights by default.";
            };
            readonly "defaults.theme": {
                readonly label: "Default Theme";
                readonly help: "Initial viewer theme.";
            };
            readonly "defaults.fileFormat": {
                readonly label: "Default File Format";
                readonly help: "Rendered file format for file mode (PNG or PDF).";
            };
            readonly "defaults.fileQuality": {
                readonly label: "Default File Quality";
                readonly help: "Quality preset for PNG/PDF rendering.";
            };
            readonly "defaults.fileScale": {
                readonly label: "Default File Scale";
                readonly help: "Device scale factor used while rendering file artifacts.";
            };
            readonly "defaults.fileMaxWidth": {
                readonly label: "Default File Max Width";
                readonly help: "Maximum file render width in CSS pixels.";
            };
            readonly "defaults.mode": {
                readonly label: "Default Output Mode";
                readonly help: "Tool default when mode is omitted. Use view for canvas/gateway viewer, file for PNG/PDF, or both.";
            };
            readonly "security.allowRemoteViewer": {
                readonly label: "Allow Remote Viewer";
                readonly help: "Allow non-loopback access to diff viewer URLs when the token path is known.";
            };
        };
    };
}, {
    readonly dirName: "discord";
    readonly idHint: "discord";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/discord";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Discord channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "discord";
            readonly label: "Discord";
            readonly selectionLabel: "Discord (Bot API)";
            readonly detailLabel: "Discord Bot";
            readonly docsPath: "/channels/discord";
            readonly docsLabel: "discord";
            readonly blurb: "very well supported right now.";
            readonly systemImage: "bubble.left.and.bubble.right";
        };
        readonly install: {
            readonly npmSpec: "@openclaw/discord";
            readonly localPath: "extensions/discord";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "discord";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["discord"];
    };
}, {
    readonly dirName: "duckduckgo";
    readonly idHint: "duckduckgo-plugin";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/duckduckgo-plugin";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw DuckDuckGo plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "duckduckgo";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly webSearch: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly region: {
                            readonly type: "string";
                        };
                        readonly safeSearch: {
                            readonly type: "string";
                            readonly enum: readonly ["strict", "moderate", "off"];
                        };
                    };
                };
            };
        };
        readonly uiHints: {
            readonly "webSearch.region": {
                readonly label: "DuckDuckGo Region";
                readonly help: "Optional DuckDuckGo region code such as us-en, uk-en, or de-de.";
            };
            readonly "webSearch.safeSearch": {
                readonly label: "DuckDuckGo SafeSearch";
                readonly help: "SafeSearch level for DuckDuckGo results.";
            };
        };
    };
}, {
    readonly dirName: "elevenlabs";
    readonly idHint: "elevenlabs";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/elevenlabs-speech";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw ElevenLabs speech plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "elevenlabs";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
    };
}, {
    readonly dirName: "exa";
    readonly idHint: "exa-plugin";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/exa-plugin";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Exa plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "exa";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly webSearch: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly apiKey: {
                            readonly type: readonly ["string", "object"];
                        };
                    };
                };
            };
        };
        readonly providerAuthEnvVars: {
            readonly exa: readonly ["EXA_API_KEY"];
        };
        readonly uiHints: {
            readonly "webSearch.apiKey": {
                readonly label: "Exa API Key";
                readonly help: "Exa Search API key (fallback: EXA_API_KEY env var).";
                readonly sensitive: true;
                readonly placeholder: "exa-...";
            };
        };
    };
}, {
    readonly dirName: "fal";
    readonly idHint: "fal";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/fal-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw fal provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "fal";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["fal"];
        readonly providerAuthEnvVars: {
            readonly fal: readonly ["FAL_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "fal";
            readonly method: "api-key";
            readonly choiceId: "fal-api-key";
            readonly choiceLabel: "fal API key";
            readonly groupId: "fal";
            readonly groupLabel: "fal";
            readonly groupHint: "Image generation";
            readonly onboardingScopes: readonly ["image-generation"];
            readonly optionKey: "falApiKey";
            readonly cliFlag: "--fal-api-key";
            readonly cliOption: "--fal-api-key <key>";
            readonly cliDescription: "fal API key";
        }];
    };
}, {
    readonly dirName: "feishu";
    readonly idHint: "feishu";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/feishu";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Feishu/Lark channel plugin (community maintained by @m1heng)";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "feishu";
            readonly label: "Feishu";
            readonly selectionLabel: "Feishu/Lark (飞书)";
            readonly docsPath: "/channels/feishu";
            readonly docsLabel: "feishu";
            readonly blurb: "飞书/Lark enterprise messaging with doc/wiki/drive tools.";
            readonly aliases: readonly ["lark"];
            readonly order: 35;
            readonly quickstartAllowFrom: true;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/feishu";
            readonly localPath: "extensions/feishu";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "feishu";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["feishu"];
        readonly skills: readonly ["./skills"];
    };
}, {
    readonly dirName: "firecrawl";
    readonly idHint: "firecrawl-plugin";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/firecrawl-plugin";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Firecrawl plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "firecrawl";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly webSearch: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly apiKey: {
                            readonly type: readonly ["string", "object"];
                        };
                        readonly baseUrl: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
        readonly providerAuthEnvVars: {
            readonly firecrawl: readonly ["FIRECRAWL_API_KEY"];
        };
        readonly uiHints: {
            readonly "webSearch.apiKey": {
                readonly label: "Firecrawl Search API Key";
                readonly help: "Firecrawl API key for web search (fallback: FIRECRAWL_API_KEY env var).";
                readonly sensitive: true;
                readonly placeholder: "fc-...";
            };
            readonly "webSearch.baseUrl": {
                readonly label: "Firecrawl Search Base URL";
                readonly help: "Firecrawl Search base URL override.";
            };
        };
    };
}, {
    readonly dirName: "github-copilot";
    readonly idHint: "github-copilot";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/github-copilot-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw GitHub Copilot provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "github-copilot";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["github-copilot"];
        readonly providerAuthEnvVars: {
            readonly "github-copilot": readonly ["COPILOT_GITHUB_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "github-copilot";
            readonly method: "device";
            readonly choiceId: "github-copilot";
            readonly choiceLabel: "GitHub Copilot";
            readonly choiceHint: "Device login with your GitHub account";
            readonly groupId: "copilot";
            readonly groupLabel: "Copilot";
            readonly groupHint: "GitHub + local proxy";
        }];
    };
}, {
    readonly dirName: "google";
    readonly idHint: "google-plugin";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/google-plugin";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Google plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "google";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly webSearch: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly apiKey: {
                            readonly type: readonly ["string", "object"];
                        };
                        readonly model: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
        readonly providers: readonly ["google", "google-gemini-cli"];
        readonly providerAuthEnvVars: {
            readonly google: readonly ["GEMINI_API_KEY", "GOOGLE_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "google";
            readonly method: "api-key";
            readonly choiceId: "gemini-api-key";
            readonly choiceLabel: "Google Gemini API key";
            readonly groupId: "google";
            readonly groupLabel: "Google";
            readonly groupHint: "Gemini API key + OAuth";
            readonly optionKey: "geminiApiKey";
            readonly cliFlag: "--gemini-api-key";
            readonly cliOption: "--gemini-api-key <key>";
            readonly cliDescription: "Gemini API key";
        }, {
            readonly provider: "google-gemini-cli";
            readonly method: "oauth";
            readonly choiceId: "google-gemini-cli";
            readonly choiceLabel: "Gemini CLI OAuth";
            readonly choiceHint: "Google OAuth with project-aware token payload";
            readonly groupId: "google";
            readonly groupLabel: "Google";
            readonly groupHint: "Gemini API key + OAuth";
        }];
        readonly uiHints: {
            readonly "webSearch.apiKey": {
                readonly label: "Gemini Search API Key";
                readonly help: "Gemini API key for Google Search grounding (fallback: GEMINI_API_KEY env var).";
                readonly sensitive: true;
                readonly placeholder: "AIza...";
            };
            readonly "webSearch.model": {
                readonly label: "Gemini Search Model";
                readonly help: "Gemini model override for web search grounding.";
            };
        };
    };
}, {
    readonly dirName: "googlechat";
    readonly idHint: "googlechat";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/googlechat";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Google Chat channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "googlechat";
            readonly label: "Google Chat";
            readonly selectionLabel: "Google Chat (Chat API)";
            readonly detailLabel: "Google Chat";
            readonly docsPath: "/channels/googlechat";
            readonly docsLabel: "googlechat";
            readonly blurb: "Google Workspace Chat app via HTTP webhooks.";
            readonly aliases: readonly ["gchat", "google-chat"];
            readonly order: 55;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/googlechat";
            readonly localPath: "extensions/googlechat";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "googlechat";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["googlechat"];
    };
}, {
    readonly dirName: "groq";
    readonly idHint: "groq";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/groq-provider";
    readonly packageVersion: "2026.3.14";
    readonly packageDescription: "OpenClaw Groq media-understanding provider";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "groq";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
    };
}, {
    readonly dirName: "huggingface";
    readonly idHint: "huggingface";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/huggingface-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Hugging Face provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "huggingface";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["huggingface"];
        readonly providerAuthEnvVars: {
            readonly huggingface: readonly ["HUGGINGFACE_HUB_TOKEN", "HF_TOKEN"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "huggingface";
            readonly method: "api-key";
            readonly choiceId: "huggingface-api-key";
            readonly choiceLabel: "Hugging Face API key";
            readonly choiceHint: "Inference API (HF token)";
            readonly groupId: "huggingface";
            readonly groupLabel: "Hugging Face";
            readonly groupHint: "Inference API (HF token)";
            readonly optionKey: "huggingfaceApiKey";
            readonly cliFlag: "--huggingface-api-key";
            readonly cliOption: "--huggingface-api-key <key>";
            readonly cliDescription: "Hugging Face API key (HF token)";
        }];
    };
}, {
    readonly dirName: "imessage";
    readonly idHint: "imessage";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/imessage";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw iMessage channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "imessage";
            readonly label: "iMessage";
            readonly selectionLabel: "iMessage (imsg)";
            readonly detailLabel: "iMessage";
            readonly docsPath: "/channels/imessage";
            readonly docsLabel: "imessage";
            readonly blurb: "this is still a work in progress.";
            readonly aliases: readonly ["imsg"];
            readonly systemImage: "message.fill";
        };
    };
    readonly manifest: {
        readonly id: "imessage";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["imessage"];
    };
}, {
    readonly dirName: "irc";
    readonly idHint: "irc";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/irc";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw IRC channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "irc";
            readonly label: "IRC";
            readonly selectionLabel: "IRC (Server + Nick)";
            readonly detailLabel: "IRC";
            readonly docsPath: "/channels/irc";
            readonly docsLabel: "irc";
            readonly blurb: "classic IRC networks with DM/channel routing and pairing controls.";
            readonly systemImage: "network";
        };
        readonly install: {
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "irc";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["irc"];
    };
}, {
    readonly dirName: "kilocode";
    readonly idHint: "kilocode";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/kilocode-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Kilo Gateway provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "kilocode";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["kilocode"];
        readonly providerAuthEnvVars: {
            readonly kilocode: readonly ["KILOCODE_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "kilocode";
            readonly method: "api-key";
            readonly choiceId: "kilocode-api-key";
            readonly choiceLabel: "Kilo Gateway API key";
            readonly choiceHint: "API key (OpenRouter-compatible)";
            readonly groupId: "kilocode";
            readonly groupLabel: "Kilo Gateway";
            readonly groupHint: "API key (OpenRouter-compatible)";
            readonly optionKey: "kilocodeApiKey";
            readonly cliFlag: "--kilocode-api-key";
            readonly cliOption: "--kilocode-api-key <key>";
            readonly cliDescription: "Kilo Gateway API key";
        }];
    };
}, {
    readonly dirName: "kimi-coding";
    readonly idHint: "kimi";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/kimi-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Kimi provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "kimi";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["kimi", "kimi-coding"];
        readonly providerAuthEnvVars: {
            readonly kimi: readonly ["KIMI_API_KEY", "KIMICODE_API_KEY"];
            readonly "kimi-coding": readonly ["KIMI_API_KEY", "KIMICODE_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "kimi";
            readonly method: "api-key";
            readonly choiceId: "kimi-code-api-key";
            readonly choiceLabel: "Kimi Code API key";
            readonly groupId: "kimi-code";
            readonly groupLabel: "Kimi Code";
            readonly groupHint: "Dedicated coding endpoint";
            readonly optionKey: "kimiCodeApiKey";
            readonly cliFlag: "--kimi-code-api-key";
            readonly cliOption: "--kimi-code-api-key <key>";
            readonly cliDescription: "Kimi Code API key";
        }];
    };
}, {
    readonly dirName: "line";
    readonly idHint: "line";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/line";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw LINE channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "line";
            readonly label: "LINE";
            readonly selectionLabel: "LINE (Messaging API)";
            readonly docsPath: "/channels/line";
            readonly docsLabel: "line";
            readonly blurb: "LINE Messaging API bot for Japan/Taiwan/Thailand markets.";
            readonly order: 75;
            readonly quickstartAllowFrom: true;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/line";
            readonly localPath: "extensions/line";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "line";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["line"];
    };
}, {
    readonly dirName: "llm-task";
    readonly idHint: "llm-task";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/llm-task";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw JSON-only LLM task plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "llm-task";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly defaultProvider: {
                    readonly type: "string";
                };
                readonly defaultModel: {
                    readonly type: "string";
                };
                readonly defaultAuthProfileId: {
                    readonly type: "string";
                };
                readonly allowedModels: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly description: "Allowlist of provider/model keys like openai-codex/gpt-5.2.";
                };
                readonly maxTokens: {
                    readonly type: "number";
                };
                readonly timeoutMs: {
                    readonly type: "number";
                };
            };
        };
        readonly name: "LLM Task";
        readonly description: "Generic JSON-only LLM tool for structured tasks callable from workflows.";
    };
}, {
    readonly dirName: "lobster";
    readonly idHint: "lobster";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/lobster";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "Lobster workflow tool plugin (typed pipelines + resumable approvals)";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "lobster";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly name: "Lobster";
        readonly description: "Typed workflow tool with resumable approvals.";
    };
}, {
    readonly dirName: "matrix";
    readonly idHint: "matrix";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/matrix";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Matrix channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "matrix";
            readonly label: "Matrix";
            readonly selectionLabel: "Matrix (plugin)";
            readonly docsPath: "/channels/matrix";
            readonly docsLabel: "matrix";
            readonly blurb: "open protocol; install the plugin to enable.";
            readonly order: 70;
            readonly quickstartAllowFrom: true;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/matrix";
            readonly localPath: "extensions/matrix";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "matrix";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["matrix"];
    };
}, {
    readonly dirName: "mattermost";
    readonly idHint: "mattermost";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/mattermost";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Mattermost channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "mattermost";
            readonly label: "Mattermost";
            readonly selectionLabel: "Mattermost (plugin)";
            readonly docsPath: "/channels/mattermost";
            readonly docsLabel: "mattermost";
            readonly blurb: "self-hosted Slack-style chat; install the plugin to enable.";
            readonly order: 65;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/mattermost";
            readonly localPath: "extensions/mattermost";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "mattermost";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["mattermost"];
    };
}, {
    readonly dirName: "memory-core";
    readonly idHint: "memory-core";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/memory-core";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw core memory search plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "memory-core";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly kind: "memory";
    };
}, {
    readonly dirName: "memory-lancedb";
    readonly idHint: "memory-lancedb";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/memory-lancedb";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw LanceDB-backed long-term memory plugin with auto-recall/capture";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly install: {
            readonly npmSpec: "@openclaw/memory-lancedb";
            readonly localPath: "extensions/memory-lancedb";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "memory-lancedb";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly embedding: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly apiKey: {
                            readonly type: "string";
                        };
                        readonly model: {
                            readonly type: "string";
                        };
                        readonly baseUrl: {
                            readonly type: "string";
                        };
                        readonly dimensions: {
                            readonly type: "number";
                        };
                    };
                    readonly required: readonly ["apiKey"];
                };
                readonly dbPath: {
                    readonly type: "string";
                };
                readonly autoCapture: {
                    readonly type: "boolean";
                };
                readonly autoRecall: {
                    readonly type: "boolean";
                };
                readonly captureMaxChars: {
                    readonly type: "number";
                    readonly minimum: 100;
                    readonly maximum: 10000;
                };
            };
            readonly required: readonly ["embedding"];
        };
        readonly kind: "memory";
        readonly uiHints: {
            readonly "embedding.apiKey": {
                readonly label: "OpenAI API Key";
                readonly sensitive: true;
                readonly placeholder: "sk-proj-...";
                readonly help: "API key for OpenAI embeddings (or use ${OPENAI_API_KEY})";
            };
            readonly "embedding.model": {
                readonly label: "Embedding Model";
                readonly placeholder: "text-embedding-3-small";
                readonly help: "OpenAI embedding model to use";
            };
            readonly "embedding.baseUrl": {
                readonly label: "Base URL";
                readonly placeholder: "https://api.openai.com/v1";
                readonly help: "Base URL for compatible providers (e.g. http://localhost:11434/v1)";
                readonly advanced: true;
            };
            readonly "embedding.dimensions": {
                readonly label: "Dimensions";
                readonly placeholder: "1536";
                readonly help: "Vector dimensions for custom models (required for non-standard models)";
                readonly advanced: true;
            };
            readonly dbPath: {
                readonly label: "Database Path";
                readonly placeholder: "~/.openclaw/memory/lancedb";
                readonly advanced: true;
            };
            readonly autoCapture: {
                readonly label: "Auto-Capture";
                readonly help: "Automatically capture important information from conversations";
            };
            readonly autoRecall: {
                readonly label: "Auto-Recall";
                readonly help: "Automatically inject relevant memories into context";
            };
            readonly captureMaxChars: {
                readonly label: "Capture Max Chars";
                readonly help: "Maximum message length eligible for auto-capture";
                readonly advanced: true;
                readonly placeholder: "500";
            };
        };
    };
}, {
    readonly dirName: "microsoft";
    readonly idHint: "microsoft";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/microsoft-speech";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Microsoft speech plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "microsoft";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
    };
}, {
    readonly dirName: "minimax";
    readonly idHint: "minimax";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/minimax-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw MiniMax provider and OAuth plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "minimax";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["minimax", "minimax-portal"];
        readonly providerAuthEnvVars: {
            readonly minimax: readonly ["MINIMAX_API_KEY"];
            readonly "minimax-portal": readonly ["MINIMAX_OAUTH_TOKEN", "MINIMAX_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "minimax-portal";
            readonly method: "oauth";
            readonly choiceId: "minimax-global-oauth";
            readonly choiceLabel: "MiniMax OAuth (Global)";
            readonly choiceHint: "Global endpoint - api.minimax.io";
            readonly groupId: "minimax";
            readonly groupLabel: "MiniMax";
            readonly groupHint: "M2.7 (recommended)";
        }, {
            readonly provider: "minimax";
            readonly method: "api-global";
            readonly choiceId: "minimax-global-api";
            readonly choiceLabel: "MiniMax API key (Global)";
            readonly choiceHint: "Global endpoint - api.minimax.io";
            readonly groupId: "minimax";
            readonly groupLabel: "MiniMax";
            readonly groupHint: "M2.7 (recommended)";
            readonly optionKey: "minimaxApiKey";
            readonly cliFlag: "--minimax-api-key";
            readonly cliOption: "--minimax-api-key <key>";
            readonly cliDescription: "MiniMax API key";
        }, {
            readonly provider: "minimax-portal";
            readonly method: "oauth-cn";
            readonly choiceId: "minimax-cn-oauth";
            readonly choiceLabel: "MiniMax OAuth (CN)";
            readonly choiceHint: "CN endpoint - api.minimaxi.com";
            readonly groupId: "minimax";
            readonly groupLabel: "MiniMax";
            readonly groupHint: "M2.7 (recommended)";
        }, {
            readonly provider: "minimax";
            readonly method: "api-cn";
            readonly choiceId: "minimax-cn-api";
            readonly choiceLabel: "MiniMax API key (CN)";
            readonly choiceHint: "CN endpoint - api.minimaxi.com";
            readonly groupId: "minimax";
            readonly groupLabel: "MiniMax";
            readonly groupHint: "M2.7 (recommended)";
            readonly optionKey: "minimaxApiKey";
            readonly cliFlag: "--minimax-api-key";
            readonly cliOption: "--minimax-api-key <key>";
            readonly cliDescription: "MiniMax API key";
        }];
    };
}, {
    readonly dirName: "mistral";
    readonly idHint: "mistral";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/mistral-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Mistral provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "mistral";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["mistral"];
        readonly providerAuthEnvVars: {
            readonly mistral: readonly ["MISTRAL_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "mistral";
            readonly method: "api-key";
            readonly choiceId: "mistral-api-key";
            readonly choiceLabel: "Mistral API key";
            readonly groupId: "mistral";
            readonly groupLabel: "Mistral AI";
            readonly groupHint: "API key";
            readonly optionKey: "mistralApiKey";
            readonly cliFlag: "--mistral-api-key";
            readonly cliOption: "--mistral-api-key <key>";
            readonly cliDescription: "Mistral API key";
        }];
    };
}, {
    readonly dirName: "modelstudio";
    readonly idHint: "modelstudio";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/modelstudio-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Model Studio provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "modelstudio";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["modelstudio"];
        readonly providerAuthEnvVars: {
            readonly modelstudio: readonly ["MODELSTUDIO_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "modelstudio";
            readonly method: "standard-api-key-cn";
            readonly choiceId: "modelstudio-standard-api-key-cn";
            readonly choiceLabel: "Standard API Key for China (pay-as-you-go)";
            readonly choiceHint: "Endpoint: dashscope.aliyuncs.com";
            readonly groupId: "modelstudio";
            readonly groupLabel: "Qwen (Alibaba Cloud Model Studio)";
            readonly groupHint: "Standard / Coding Plan (CN / Global)";
            readonly optionKey: "modelstudioStandardApiKeyCn";
            readonly cliFlag: "--modelstudio-standard-api-key-cn";
            readonly cliOption: "--modelstudio-standard-api-key-cn <key>";
            readonly cliDescription: "Alibaba Cloud Model Studio Standard API key (China)";
        }, {
            readonly provider: "modelstudio";
            readonly method: "standard-api-key";
            readonly choiceId: "modelstudio-standard-api-key";
            readonly choiceLabel: "Standard API Key for Global/Intl (pay-as-you-go)";
            readonly choiceHint: "Endpoint: dashscope-intl.aliyuncs.com";
            readonly groupId: "modelstudio";
            readonly groupLabel: "Qwen (Alibaba Cloud Model Studio)";
            readonly groupHint: "Standard / Coding Plan (CN / Global)";
            readonly optionKey: "modelstudioStandardApiKey";
            readonly cliFlag: "--modelstudio-standard-api-key";
            readonly cliOption: "--modelstudio-standard-api-key <key>";
            readonly cliDescription: "Alibaba Cloud Model Studio Standard API key (Global/Intl)";
        }, {
            readonly provider: "modelstudio";
            readonly method: "api-key-cn";
            readonly choiceId: "modelstudio-api-key-cn";
            readonly choiceLabel: "Coding Plan API Key for China (subscription)";
            readonly choiceHint: "Endpoint: coding.dashscope.aliyuncs.com";
            readonly groupId: "modelstudio";
            readonly groupLabel: "Qwen (Alibaba Cloud Model Studio)";
            readonly groupHint: "Standard / Coding Plan (CN / Global)";
            readonly optionKey: "modelstudioApiKeyCn";
            readonly cliFlag: "--modelstudio-api-key-cn";
            readonly cliOption: "--modelstudio-api-key-cn <key>";
            readonly cliDescription: "Alibaba Cloud Model Studio Coding Plan API key (China)";
        }, {
            readonly provider: "modelstudio";
            readonly method: "api-key";
            readonly choiceId: "modelstudio-api-key";
            readonly choiceLabel: "Coding Plan API Key for Global/Intl (subscription)";
            readonly choiceHint: "Endpoint: coding-intl.dashscope.aliyuncs.com";
            readonly groupId: "modelstudio";
            readonly groupLabel: "Qwen (Alibaba Cloud Model Studio)";
            readonly groupHint: "Standard / Coding Plan (CN / Global)";
            readonly optionKey: "modelstudioApiKey";
            readonly cliFlag: "--modelstudio-api-key";
            readonly cliOption: "--modelstudio-api-key <key>";
            readonly cliDescription: "Alibaba Cloud Model Studio Coding Plan API key (Global/Intl)";
        }];
    };
}, {
    readonly dirName: "moonshot";
    readonly idHint: "moonshot";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/moonshot-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Moonshot provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "moonshot";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly webSearch: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly apiKey: {
                            readonly type: readonly ["string", "object"];
                        };
                        readonly baseUrl: {
                            readonly type: "string";
                        };
                        readonly model: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
        readonly providers: readonly ["moonshot"];
        readonly providerAuthEnvVars: {
            readonly moonshot: readonly ["MOONSHOT_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "moonshot";
            readonly method: "api-key";
            readonly choiceId: "moonshot-api-key";
            readonly choiceLabel: "Moonshot API key (.ai)";
            readonly groupId: "moonshot";
            readonly groupLabel: "Moonshot AI (Kimi K2.5)";
            readonly groupHint: "Kimi K2.5";
            readonly optionKey: "moonshotApiKey";
            readonly cliFlag: "--moonshot-api-key";
            readonly cliOption: "--moonshot-api-key <key>";
            readonly cliDescription: "Moonshot API key";
        }, {
            readonly provider: "moonshot";
            readonly method: "api-key-cn";
            readonly choiceId: "moonshot-api-key-cn";
            readonly choiceLabel: "Moonshot API key (.cn)";
            readonly groupId: "moonshot";
            readonly groupLabel: "Moonshot AI (Kimi K2.5)";
            readonly groupHint: "Kimi K2.5";
            readonly optionKey: "moonshotApiKey";
            readonly cliFlag: "--moonshot-api-key";
            readonly cliOption: "--moonshot-api-key <key>";
            readonly cliDescription: "Moonshot API key";
        }];
        readonly uiHints: {
            readonly "webSearch.apiKey": {
                readonly label: "Kimi Search API Key";
                readonly help: "Moonshot/Kimi API key (fallback: KIMI_API_KEY or MOONSHOT_API_KEY env var).";
                readonly sensitive: true;
            };
            readonly "webSearch.baseUrl": {
                readonly label: "Kimi Search Base URL";
                readonly help: "Kimi base URL override.";
            };
            readonly "webSearch.model": {
                readonly label: "Kimi Search Model";
                readonly help: "Kimi model override.";
            };
        };
    };
}, {
    readonly dirName: "msteams";
    readonly idHint: "msteams";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/msteams";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Microsoft Teams channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "msteams";
            readonly label: "Microsoft Teams";
            readonly selectionLabel: "Microsoft Teams (Bot Framework)";
            readonly docsPath: "/channels/msteams";
            readonly docsLabel: "msteams";
            readonly blurb: "Bot Framework; enterprise support.";
            readonly aliases: readonly ["teams"];
            readonly order: 60;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/msteams";
            readonly localPath: "extensions/msteams";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "msteams";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["msteams"];
    };
}, {
    readonly dirName: "nextcloud-talk";
    readonly idHint: "nextcloud-talk";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/nextcloud-talk";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Nextcloud Talk channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "nextcloud-talk";
            readonly label: "Nextcloud Talk";
            readonly selectionLabel: "Nextcloud Talk (self-hosted)";
            readonly docsPath: "/channels/nextcloud-talk";
            readonly docsLabel: "nextcloud-talk";
            readonly blurb: "Self-hosted chat via Nextcloud Talk webhook bots.";
            readonly aliases: readonly ["nc-talk", "nc"];
            readonly order: 65;
            readonly quickstartAllowFrom: true;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/nextcloud-talk";
            readonly localPath: "extensions/nextcloud-talk";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "nextcloud-talk";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["nextcloud-talk"];
    };
}, {
    readonly dirName: "nostr";
    readonly idHint: "nostr";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/nostr";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Nostr channel plugin for NIP-04 encrypted DMs";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "nostr";
            readonly label: "Nostr";
            readonly selectionLabel: "Nostr (NIP-04 DMs)";
            readonly docsPath: "/channels/nostr";
            readonly docsLabel: "nostr";
            readonly blurb: "Decentralized protocol; encrypted DMs via NIP-04.";
            readonly order: 55;
            readonly quickstartAllowFrom: true;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/nostr";
            readonly localPath: "extensions/nostr";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "nostr";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["nostr"];
    };
}, {
    readonly dirName: "nvidia";
    readonly idHint: "nvidia";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/nvidia-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw NVIDIA provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "nvidia";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["nvidia"];
        readonly providerAuthEnvVars: {
            readonly nvidia: readonly ["NVIDIA_API_KEY"];
        };
    };
}, {
    readonly dirName: "ollama";
    readonly idHint: "ollama";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/ollama-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Ollama provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "ollama";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["ollama"];
        readonly providerAuthEnvVars: {
            readonly ollama: readonly ["OLLAMA_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "ollama";
            readonly method: "local";
            readonly choiceId: "ollama";
            readonly choiceLabel: "Ollama";
            readonly choiceHint: "Cloud and local open models";
            readonly groupId: "ollama";
            readonly groupLabel: "Ollama";
            readonly groupHint: "Cloud and local open models";
        }];
    };
}, {
    readonly dirName: "open-prose";
    readonly idHint: "open-prose";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/open-prose";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenProse VM skill pack plugin (slash command + telemetry).";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "open-prose";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly skills: readonly ["./skills"];
        readonly name: "OpenProse";
        readonly description: "OpenProse VM skill pack with a /prose slash command.";
    };
}, {
    readonly dirName: "openai";
    readonly idHint: "openai";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/openai-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw OpenAI provider plugins";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "openai";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["openai", "openai-codex"];
        readonly providerAuthEnvVars: {
            readonly openai: readonly ["OPENAI_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "openai-codex";
            readonly method: "oauth";
            readonly choiceId: "openai-codex";
            readonly choiceLabel: "OpenAI Codex (ChatGPT OAuth)";
            readonly choiceHint: "Browser sign-in";
            readonly groupId: "openai";
            readonly groupLabel: "OpenAI";
            readonly groupHint: "Codex OAuth + API key";
        }, {
            readonly provider: "openai";
            readonly method: "api-key";
            readonly choiceId: "openai-api-key";
            readonly choiceLabel: "OpenAI API key";
            readonly groupId: "openai";
            readonly groupLabel: "OpenAI";
            readonly groupHint: "Codex OAuth + API key";
            readonly optionKey: "openaiApiKey";
            readonly cliFlag: "--openai-api-key";
            readonly cliOption: "--openai-api-key <key>";
            readonly cliDescription: "OpenAI API key";
        }];
    };
}, {
    readonly dirName: "opencode";
    readonly idHint: "opencode";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/opencode-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw OpenCode Zen provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "opencode";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["opencode"];
        readonly providerAuthEnvVars: {
            readonly opencode: readonly ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "opencode";
            readonly method: "api-key";
            readonly choiceId: "opencode-zen";
            readonly choiceLabel: "OpenCode Zen catalog";
            readonly groupId: "opencode";
            readonly groupLabel: "OpenCode";
            readonly groupHint: "Shared API key for Zen + Go catalogs";
            readonly optionKey: "opencodeZenApiKey";
            readonly cliFlag: "--opencode-zen-api-key";
            readonly cliOption: "--opencode-zen-api-key <key>";
            readonly cliDescription: "OpenCode API key (Zen catalog)";
        }];
    };
}, {
    readonly dirName: "opencode-go";
    readonly idHint: "opencode-go";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/opencode-go-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw OpenCode Go provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "opencode-go";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["opencode-go"];
        readonly providerAuthEnvVars: {
            readonly "opencode-go": readonly ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "opencode-go";
            readonly method: "api-key";
            readonly choiceId: "opencode-go";
            readonly choiceLabel: "OpenCode Go catalog";
            readonly groupId: "opencode";
            readonly groupLabel: "OpenCode";
            readonly groupHint: "Shared API key for Zen + Go catalogs";
            readonly optionKey: "opencodeGoApiKey";
            readonly cliFlag: "--opencode-go-api-key";
            readonly cliOption: "--opencode-go-api-key <key>";
            readonly cliDescription: "OpenCode API key (Go catalog)";
        }];
    };
}, {
    readonly dirName: "openrouter";
    readonly idHint: "openrouter";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/openrouter-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw OpenRouter provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "openrouter";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["openrouter"];
        readonly providerAuthEnvVars: {
            readonly openrouter: readonly ["OPENROUTER_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "openrouter";
            readonly method: "api-key";
            readonly choiceId: "openrouter-api-key";
            readonly choiceLabel: "OpenRouter API key";
            readonly groupId: "openrouter";
            readonly groupLabel: "OpenRouter";
            readonly groupHint: "API key";
            readonly optionKey: "openrouterApiKey";
            readonly cliFlag: "--openrouter-api-key";
            readonly cliOption: "--openrouter-api-key <key>";
            readonly cliDescription: "OpenRouter API key";
        }];
    };
}, {
    readonly dirName: "openshell";
    readonly idHint: "openshell-sandbox";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/openshell-sandbox";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw OpenShell sandbox backend";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "openshell";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly command: {
                    readonly type: "string";
                };
                readonly gateway: {
                    readonly type: "string";
                };
                readonly gatewayEndpoint: {
                    readonly type: "string";
                };
                readonly from: {
                    readonly type: "string";
                };
                readonly policy: {
                    readonly type: "string";
                };
                readonly providers: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly gpu: {
                    readonly type: "boolean";
                };
                readonly autoProviders: {
                    readonly type: "boolean";
                };
                readonly remoteWorkspaceDir: {
                    readonly type: "string";
                };
                readonly remoteAgentWorkspaceDir: {
                    readonly type: "string";
                };
                readonly timeoutSeconds: {
                    readonly type: "number";
                    readonly minimum: 1;
                };
            };
        };
        readonly name: "OpenShell Sandbox";
        readonly description: "Sandbox backend powered by OpenShell with mirrored local workspaces and SSH-based command execution.";
        readonly uiHints: {
            readonly command: {
                readonly label: "OpenShell Command";
                readonly help: "Path or command name for the openshell CLI.";
            };
            readonly gateway: {
                readonly label: "Gateway Name";
                readonly help: "Optional OpenShell gateway name passed as --gateway.";
            };
            readonly gatewayEndpoint: {
                readonly label: "Gateway Endpoint";
                readonly help: "Optional OpenShell gateway endpoint passed as --gateway-endpoint.";
            };
            readonly from: {
                readonly label: "Sandbox Source";
                readonly help: "OpenShell sandbox source for first-time create. Defaults to openclaw.";
            };
            readonly policy: {
                readonly label: "Policy File";
                readonly help: "Optional path to a custom OpenShell sandbox policy YAML.";
            };
            readonly providers: {
                readonly label: "Providers";
                readonly help: "Provider names to attach when a sandbox is created.";
            };
            readonly gpu: {
                readonly label: "GPU";
                readonly help: "Request GPU resources when creating the sandbox.";
                readonly advanced: true;
            };
            readonly autoProviders: {
                readonly label: "Auto-create Providers";
                readonly help: "When enabled, pass --auto-providers during sandbox create.";
                readonly advanced: true;
            };
            readonly remoteWorkspaceDir: {
                readonly label: "Remote Workspace Dir";
                readonly help: "Primary writable workspace inside the OpenShell sandbox.";
                readonly advanced: true;
            };
            readonly remoteAgentWorkspaceDir: {
                readonly label: "Remote Agent Dir";
                readonly help: "Mirror path for the real agent workspace when workspaceAccess is read-only.";
                readonly advanced: true;
            };
            readonly timeoutSeconds: {
                readonly label: "Command Timeout Seconds";
                readonly help: "Timeout for openshell CLI operations such as create/upload/download.";
                readonly advanced: true;
            };
        };
    };
}, {
    readonly dirName: "perplexity";
    readonly idHint: "perplexity-plugin";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/perplexity-plugin";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Perplexity plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "perplexity";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly webSearch: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly apiKey: {
                            readonly type: readonly ["string", "object"];
                        };
                        readonly baseUrl: {
                            readonly type: "string";
                        };
                        readonly model: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
        readonly providerAuthEnvVars: {
            readonly perplexity: readonly ["PERPLEXITY_API_KEY", "OPENROUTER_API_KEY"];
        };
        readonly uiHints: {
            readonly "webSearch.apiKey": {
                readonly label: "Perplexity API Key";
                readonly help: "Perplexity or OpenRouter API key for web search.";
                readonly sensitive: true;
                readonly placeholder: "pplx-...";
            };
            readonly "webSearch.baseUrl": {
                readonly label: "Perplexity Base URL";
                readonly help: "Optional Perplexity/OpenRouter chat-completions base URL override.";
            };
            readonly "webSearch.model": {
                readonly label: "Perplexity Model";
                readonly help: "Optional Sonar/OpenRouter model override.";
            };
        };
    };
}, {
    readonly dirName: "qianfan";
    readonly idHint: "qianfan";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/qianfan-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Qianfan provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "qianfan";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["qianfan"];
        readonly providerAuthEnvVars: {
            readonly qianfan: readonly ["QIANFAN_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "qianfan";
            readonly method: "api-key";
            readonly choiceId: "qianfan-api-key";
            readonly choiceLabel: "Qianfan API key";
            readonly groupId: "qianfan";
            readonly groupLabel: "Qianfan";
            readonly groupHint: "API key";
            readonly optionKey: "qianfanApiKey";
            readonly cliFlag: "--qianfan-api-key";
            readonly cliOption: "--qianfan-api-key <key>";
            readonly cliDescription: "QIANFAN API key";
        }];
    };
}, {
    readonly dirName: "sglang";
    readonly idHint: "sglang";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/sglang-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw SGLang provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "sglang";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["sglang"];
        readonly providerAuthEnvVars: {
            readonly sglang: readonly ["SGLANG_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "sglang";
            readonly method: "custom";
            readonly choiceId: "sglang";
            readonly choiceLabel: "SGLang";
            readonly choiceHint: "Fast self-hosted OpenAI-compatible server";
            readonly groupId: "sglang";
            readonly groupLabel: "SGLang";
            readonly groupHint: "Fast self-hosted server";
        }];
    };
}, {
    readonly dirName: "signal";
    readonly idHint: "signal";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/signal";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Signal channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "signal";
            readonly label: "Signal";
            readonly selectionLabel: "Signal (signal-cli)";
            readonly detailLabel: "Signal REST";
            readonly docsPath: "/channels/signal";
            readonly docsLabel: "signal";
            readonly blurb: "signal-cli linked device; more setup (David Reagans: \"Hop on Discord.\").";
            readonly systemImage: "antenna.radiowaves.left.and.right";
        };
    };
    readonly manifest: {
        readonly id: "signal";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["signal"];
    };
}, {
    readonly dirName: "slack";
    readonly idHint: "slack";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/slack";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Slack channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "slack";
            readonly label: "Slack";
            readonly selectionLabel: "Slack (Socket Mode)";
            readonly detailLabel: "Slack Bot";
            readonly docsPath: "/channels/slack";
            readonly docsLabel: "slack";
            readonly blurb: "supported (Socket Mode).";
            readonly systemImage: "number";
        };
    };
    readonly manifest: {
        readonly id: "slack";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["slack"];
    };
}, {
    readonly dirName: "synology-chat";
    readonly idHint: "synology-chat";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/synology-chat";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "Synology Chat channel plugin for OpenClaw";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "synology-chat";
            readonly label: "Synology Chat";
            readonly selectionLabel: "Synology Chat (Webhook)";
            readonly docsPath: "/channels/synology-chat";
            readonly docsLabel: "synology-chat";
            readonly blurb: "Connect your Synology NAS Chat to OpenClaw with full agent capabilities.";
            readonly order: 90;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/synology-chat";
            readonly localPath: "extensions/synology-chat";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "synology-chat";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["synology-chat"];
    };
}, {
    readonly dirName: "synthetic";
    readonly idHint: "synthetic";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/synthetic-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Synthetic provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "synthetic";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["synthetic"];
        readonly providerAuthEnvVars: {
            readonly synthetic: readonly ["SYNTHETIC_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "synthetic";
            readonly method: "api-key";
            readonly choiceId: "synthetic-api-key";
            readonly choiceLabel: "Synthetic API key";
            readonly groupId: "synthetic";
            readonly groupLabel: "Synthetic";
            readonly groupHint: "Anthropic-compatible (multi-model)";
            readonly optionKey: "syntheticApiKey";
            readonly cliFlag: "--synthetic-api-key";
            readonly cliOption: "--synthetic-api-key <key>";
            readonly cliDescription: "Synthetic API key";
        }];
    };
}, {
    readonly dirName: "tavily";
    readonly idHint: "tavily-plugin";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/tavily-plugin";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Tavily plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "tavily";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly webSearch: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly apiKey: {
                            readonly type: readonly ["string", "object"];
                        };
                        readonly baseUrl: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
        readonly providerAuthEnvVars: {
            readonly tavily: readonly ["TAVILY_API_KEY"];
        };
        readonly skills: readonly ["./skills"];
        readonly uiHints: {
            readonly "webSearch.apiKey": {
                readonly label: "Tavily API Key";
                readonly help: "Tavily API key for web search and extraction (fallback: TAVILY_API_KEY env var).";
                readonly sensitive: true;
                readonly placeholder: "tvly-...";
            };
            readonly "webSearch.baseUrl": {
                readonly label: "Tavily Base URL";
                readonly help: "Tavily API base URL override.";
            };
        };
    };
}, {
    readonly dirName: "telegram";
    readonly idHint: "telegram";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/telegram";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Telegram channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "telegram";
            readonly label: "Telegram";
            readonly selectionLabel: "Telegram (Bot API)";
            readonly detailLabel: "Telegram Bot";
            readonly docsPath: "/channels/telegram";
            readonly docsLabel: "telegram";
            readonly blurb: "simplest way to get started — register a bot with @BotFather and get going.";
            readonly systemImage: "paperplane";
        };
    };
    readonly manifest: {
        readonly id: "telegram";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["telegram"];
    };
}, {
    readonly dirName: "tlon";
    readonly idHint: "tlon";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/tlon";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Tlon/Urbit channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "tlon";
            readonly label: "Tlon";
            readonly selectionLabel: "Tlon (Urbit)";
            readonly docsPath: "/channels/tlon";
            readonly docsLabel: "tlon";
            readonly blurb: "decentralized messaging on Urbit; install the plugin to enable.";
            readonly order: 90;
            readonly quickstartAllowFrom: true;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/tlon";
            readonly localPath: "extensions/tlon";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "tlon";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["tlon"];
        readonly skills: readonly ["node_modules/@tloncorp/tlon-skill"];
    };
}, {
    readonly dirName: "together";
    readonly idHint: "together";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/together-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Together provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "together";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["together"];
        readonly providerAuthEnvVars: {
            readonly together: readonly ["TOGETHER_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "together";
            readonly method: "api-key";
            readonly choiceId: "together-api-key";
            readonly choiceLabel: "Together AI API key";
            readonly groupId: "together";
            readonly groupLabel: "Together AI";
            readonly groupHint: "API key";
            readonly optionKey: "togetherApiKey";
            readonly cliFlag: "--together-api-key";
            readonly cliOption: "--together-api-key <key>";
            readonly cliDescription: "Together AI API key";
        }];
    };
}, {
    readonly dirName: "twitch";
    readonly idHint: "twitch";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/twitch";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Twitch channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly channel: {
            readonly id: "twitch";
            readonly label: "Twitch";
            readonly selectionLabel: "Twitch (Chat)";
            readonly docsPath: "/channels/twitch";
            readonly blurb: "Twitch chat integration";
            readonly aliases: readonly ["twitch-chat"];
        };
        readonly install: {
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "twitch";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["twitch"];
    };
}, {
    readonly dirName: "venice";
    readonly idHint: "venice";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/venice-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Venice provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "venice";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["venice"];
        readonly providerAuthEnvVars: {
            readonly venice: readonly ["VENICE_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "venice";
            readonly method: "api-key";
            readonly choiceId: "venice-api-key";
            readonly choiceLabel: "Venice AI API key";
            readonly groupId: "venice";
            readonly groupLabel: "Venice AI";
            readonly groupHint: "Privacy-focused (uncensored models)";
            readonly optionKey: "veniceApiKey";
            readonly cliFlag: "--venice-api-key";
            readonly cliOption: "--venice-api-key <key>";
            readonly cliDescription: "Venice API key";
        }];
    };
}, {
    readonly dirName: "vercel-ai-gateway";
    readonly idHint: "vercel-ai-gateway";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/vercel-ai-gateway-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Vercel AI Gateway provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "vercel-ai-gateway";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["vercel-ai-gateway"];
        readonly providerAuthEnvVars: {
            readonly "vercel-ai-gateway": readonly ["AI_GATEWAY_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "vercel-ai-gateway";
            readonly method: "api-key";
            readonly choiceId: "ai-gateway-api-key";
            readonly choiceLabel: "Vercel AI Gateway API key";
            readonly groupId: "ai-gateway";
            readonly groupLabel: "Vercel AI Gateway";
            readonly groupHint: "API key";
            readonly optionKey: "aiGatewayApiKey";
            readonly cliFlag: "--ai-gateway-api-key";
            readonly cliOption: "--ai-gateway-api-key <key>";
            readonly cliDescription: "Vercel AI Gateway API key";
        }];
    };
}, {
    readonly dirName: "vllm";
    readonly idHint: "vllm";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/vllm-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw vLLM provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "vllm";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["vllm"];
        readonly providerAuthEnvVars: {
            readonly vllm: readonly ["VLLM_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "vllm";
            readonly method: "custom";
            readonly choiceId: "vllm";
            readonly choiceLabel: "vLLM";
            readonly choiceHint: "Local/self-hosted OpenAI-compatible server";
            readonly groupId: "vllm";
            readonly groupLabel: "vLLM";
            readonly groupHint: "Local/self-hosted OpenAI-compatible";
        }];
    };
}, {
    readonly dirName: "voice-call";
    readonly idHint: "voice-call";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/voice-call";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw voice-call plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly install: {
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "voice-call";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly enabled: {
                    readonly type: "boolean";
                };
                readonly provider: {
                    readonly type: "string";
                    readonly enum: readonly ["telnyx", "twilio", "plivo", "mock"];
                };
                readonly telnyx: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly apiKey: {
                            readonly type: "string";
                        };
                        readonly connectionId: {
                            readonly type: "string";
                        };
                        readonly publicKey: {
                            readonly type: "string";
                        };
                    };
                };
                readonly twilio: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly accountSid: {
                            readonly type: "string";
                        };
                        readonly authToken: {
                            readonly type: "string";
                        };
                    };
                };
                readonly plivo: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly authId: {
                            readonly type: "string";
                        };
                        readonly authToken: {
                            readonly type: "string";
                        };
                    };
                };
                readonly fromNumber: {
                    readonly type: "string";
                    readonly pattern: "^\\+[1-9]\\d{1,14}$";
                };
                readonly toNumber: {
                    readonly type: "string";
                    readonly pattern: "^\\+[1-9]\\d{1,14}$";
                };
                readonly inboundPolicy: {
                    readonly type: "string";
                    readonly enum: readonly ["disabled", "allowlist", "pairing", "open"];
                };
                readonly allowFrom: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly pattern: "^\\+[1-9]\\d{1,14}$";
                    };
                };
                readonly inboundGreeting: {
                    readonly type: "string";
                };
                readonly outbound: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly defaultMode: {
                            readonly type: "string";
                            readonly enum: readonly ["notify", "conversation"];
                        };
                        readonly notifyHangupDelaySec: {
                            readonly type: "integer";
                            readonly minimum: 0;
                        };
                    };
                };
                readonly maxDurationSeconds: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
                readonly staleCallReaperSeconds: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly silenceTimeoutMs: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
                readonly transcriptTimeoutMs: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
                readonly ringTimeoutMs: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
                readonly maxConcurrentCalls: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
                readonly serve: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly port: {
                            readonly type: "integer";
                            readonly minimum: 1;
                        };
                        readonly bind: {
                            readonly type: "string";
                        };
                        readonly path: {
                            readonly type: "string";
                        };
                    };
                };
                readonly tailscale: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly mode: {
                            readonly type: "string";
                            readonly enum: readonly ["off", "serve", "funnel"];
                        };
                        readonly path: {
                            readonly type: "string";
                        };
                    };
                };
                readonly tunnel: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly provider: {
                            readonly type: "string";
                            readonly enum: readonly ["none", "ngrok", "tailscale-serve", "tailscale-funnel"];
                        };
                        readonly ngrokAuthToken: {
                            readonly type: "string";
                        };
                        readonly ngrokDomain: {
                            readonly type: "string";
                        };
                        readonly allowNgrokFreeTierLoopbackBypass: {
                            readonly type: "boolean";
                        };
                    };
                };
                readonly webhookSecurity: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly allowedHosts: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                        readonly trustForwardingHeaders: {
                            readonly type: "boolean";
                        };
                        readonly trustedProxyIPs: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly streaming: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly enabled: {
                            readonly type: "boolean";
                        };
                        readonly sttProvider: {
                            readonly type: "string";
                            readonly enum: readonly ["openai-realtime"];
                        };
                        readonly openaiApiKey: {
                            readonly type: "string";
                        };
                        readonly sttModel: {
                            readonly type: "string";
                        };
                        readonly silenceDurationMs: {
                            readonly type: "integer";
                            readonly minimum: 1;
                        };
                        readonly vadThreshold: {
                            readonly type: "number";
                            readonly minimum: 0;
                            readonly maximum: 1;
                        };
                        readonly streamPath: {
                            readonly type: "string";
                        };
                        readonly preStartTimeoutMs: {
                            readonly type: "integer";
                            readonly minimum: 1;
                        };
                        readonly maxPendingConnections: {
                            readonly type: "integer";
                            readonly minimum: 1;
                        };
                        readonly maxPendingConnectionsPerIp: {
                            readonly type: "integer";
                            readonly minimum: 1;
                        };
                        readonly maxConnections: {
                            readonly type: "integer";
                            readonly minimum: 1;
                        };
                    };
                };
                readonly publicUrl: {
                    readonly type: "string";
                };
                readonly skipSignatureVerification: {
                    readonly type: "boolean";
                };
                readonly stt: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly provider: {
                            readonly type: "string";
                            readonly enum: readonly ["openai"];
                        };
                        readonly model: {
                            readonly type: "string";
                        };
                    };
                };
                readonly tts: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly auto: {
                            readonly type: "string";
                            readonly enum: readonly ["off", "always", "inbound", "tagged"];
                        };
                        readonly enabled: {
                            readonly type: "boolean";
                        };
                        readonly mode: {
                            readonly type: "string";
                            readonly enum: readonly ["final", "all"];
                        };
                        readonly provider: {
                            readonly type: "string";
                        };
                        readonly summaryModel: {
                            readonly type: "string";
                        };
                        readonly modelOverrides: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly enabled: {
                                    readonly type: "boolean";
                                };
                                readonly allowText: {
                                    readonly type: "boolean";
                                };
                                readonly allowProvider: {
                                    readonly type: "boolean";
                                };
                                readonly allowVoice: {
                                    readonly type: "boolean";
                                };
                                readonly allowModelId: {
                                    readonly type: "boolean";
                                };
                                readonly allowVoiceSettings: {
                                    readonly type: "boolean";
                                };
                                readonly allowNormalization: {
                                    readonly type: "boolean";
                                };
                                readonly allowSeed: {
                                    readonly type: "boolean";
                                };
                            };
                        };
                        readonly elevenlabs: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly apiKey: {
                                    readonly type: "string";
                                };
                                readonly baseUrl: {
                                    readonly type: "string";
                                };
                                readonly voiceId: {
                                    readonly type: "string";
                                };
                                readonly modelId: {
                                    readonly type: "string";
                                };
                                readonly seed: {
                                    readonly type: "integer";
                                    readonly minimum: 0;
                                    readonly maximum: 4294967295;
                                };
                                readonly applyTextNormalization: {
                                    readonly type: "string";
                                    readonly enum: readonly ["auto", "on", "off"];
                                };
                                readonly languageCode: {
                                    readonly type: "string";
                                };
                                readonly voiceSettings: {
                                    readonly type: "object";
                                    readonly additionalProperties: false;
                                    readonly properties: {
                                        readonly stability: {
                                            readonly type: "number";
                                            readonly minimum: 0;
                                            readonly maximum: 1;
                                        };
                                        readonly similarityBoost: {
                                            readonly type: "number";
                                            readonly minimum: 0;
                                            readonly maximum: 1;
                                        };
                                        readonly style: {
                                            readonly type: "number";
                                            readonly minimum: 0;
                                            readonly maximum: 1;
                                        };
                                        readonly useSpeakerBoost: {
                                            readonly type: "boolean";
                                        };
                                        readonly speed: {
                                            readonly type: "number";
                                            readonly minimum: 0.5;
                                            readonly maximum: 2;
                                        };
                                    };
                                };
                            };
                        };
                        readonly openai: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly apiKey: {
                                    readonly type: "string";
                                };
                                readonly baseUrl: {
                                    readonly type: "string";
                                };
                                readonly model: {
                                    readonly type: "string";
                                };
                                readonly voice: {
                                    readonly type: "string";
                                };
                                readonly speed: {
                                    readonly type: "number";
                                    readonly minimum: 0.25;
                                    readonly maximum: 4;
                                };
                                readonly instructions: {
                                    readonly type: "string";
                                };
                            };
                        };
                        readonly edge: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly enabled: {
                                    readonly type: "boolean";
                                };
                                readonly voice: {
                                    readonly type: "string";
                                };
                                readonly lang: {
                                    readonly type: "string";
                                };
                                readonly outputFormat: {
                                    readonly type: "string";
                                };
                                readonly pitch: {
                                    readonly type: "string";
                                };
                                readonly rate: {
                                    readonly type: "string";
                                };
                                readonly volume: {
                                    readonly type: "string";
                                };
                                readonly saveSubtitles: {
                                    readonly type: "boolean";
                                };
                                readonly proxy: {
                                    readonly type: "string";
                                };
                                readonly timeoutMs: {
                                    readonly type: "integer";
                                    readonly minimum: 1000;
                                    readonly maximum: 120000;
                                };
                            };
                        };
                        readonly prefsPath: {
                            readonly type: "string";
                        };
                        readonly maxTextLength: {
                            readonly type: "integer";
                            readonly minimum: 1;
                        };
                        readonly timeoutMs: {
                            readonly type: "integer";
                            readonly minimum: 1000;
                            readonly maximum: 120000;
                        };
                    };
                };
                readonly store: {
                    readonly type: "string";
                };
                readonly responseModel: {
                    readonly type: "string";
                };
                readonly responseSystemPrompt: {
                    readonly type: "string";
                };
                readonly responseTimeoutMs: {
                    readonly type: "integer";
                    readonly minimum: 1;
                };
            };
        };
        readonly uiHints: {
            readonly provider: {
                readonly label: "Provider";
                readonly help: "Use twilio, telnyx, or mock for dev/no-network.";
            };
            readonly fromNumber: {
                readonly label: "From Number";
                readonly placeholder: "+15550001234";
            };
            readonly toNumber: {
                readonly label: "Default To Number";
                readonly placeholder: "+15550001234";
            };
            readonly inboundPolicy: {
                readonly label: "Inbound Policy";
            };
            readonly allowFrom: {
                readonly label: "Inbound Allowlist";
            };
            readonly inboundGreeting: {
                readonly label: "Inbound Greeting";
                readonly advanced: true;
            };
            readonly "telnyx.apiKey": {
                readonly label: "Telnyx API Key";
                readonly sensitive: true;
            };
            readonly "telnyx.connectionId": {
                readonly label: "Telnyx Connection ID";
            };
            readonly "telnyx.publicKey": {
                readonly label: "Telnyx Public Key";
                readonly sensitive: true;
            };
            readonly "twilio.accountSid": {
                readonly label: "Twilio Account SID";
            };
            readonly "twilio.authToken": {
                readonly label: "Twilio Auth Token";
                readonly sensitive: true;
            };
            readonly "outbound.defaultMode": {
                readonly label: "Default Call Mode";
            };
            readonly "outbound.notifyHangupDelaySec": {
                readonly label: "Notify Hangup Delay (sec)";
                readonly advanced: true;
            };
            readonly "serve.port": {
                readonly label: "Webhook Port";
            };
            readonly "serve.bind": {
                readonly label: "Webhook Bind";
            };
            readonly "serve.path": {
                readonly label: "Webhook Path";
            };
            readonly "tailscale.mode": {
                readonly label: "Tailscale Mode";
                readonly advanced: true;
            };
            readonly "tailscale.path": {
                readonly label: "Tailscale Path";
                readonly advanced: true;
            };
            readonly "tunnel.provider": {
                readonly label: "Tunnel Provider";
                readonly advanced: true;
            };
            readonly "tunnel.ngrokAuthToken": {
                readonly label: "ngrok Auth Token";
                readonly sensitive: true;
                readonly advanced: true;
            };
            readonly "tunnel.ngrokDomain": {
                readonly label: "ngrok Domain";
                readonly advanced: true;
            };
            readonly "tunnel.allowNgrokFreeTierLoopbackBypass": {
                readonly label: "Allow ngrok Free Tier (Loopback Bypass)";
                readonly advanced: true;
            };
            readonly "streaming.enabled": {
                readonly label: "Enable Streaming";
                readonly advanced: true;
            };
            readonly "streaming.openaiApiKey": {
                readonly label: "OpenAI Realtime API Key";
                readonly sensitive: true;
                readonly advanced: true;
            };
            readonly "streaming.sttModel": {
                readonly label: "Realtime STT Model";
                readonly advanced: true;
            };
            readonly "streaming.streamPath": {
                readonly label: "Media Stream Path";
                readonly advanced: true;
            };
            readonly "tts.provider": {
                readonly label: "TTS Provider Override";
                readonly help: "Deep-merges with messages.tts (Microsoft is ignored for calls).";
                readonly advanced: true;
            };
            readonly "tts.openai.model": {
                readonly label: "OpenAI TTS Model";
                readonly advanced: true;
            };
            readonly "tts.openai.voice": {
                readonly label: "OpenAI TTS Voice";
                readonly advanced: true;
            };
            readonly "tts.openai.apiKey": {
                readonly label: "OpenAI API Key";
                readonly sensitive: true;
                readonly advanced: true;
            };
            readonly "tts.elevenlabs.modelId": {
                readonly label: "ElevenLabs Model ID";
                readonly advanced: true;
            };
            readonly "tts.elevenlabs.voiceId": {
                readonly label: "ElevenLabs Voice ID";
                readonly advanced: true;
            };
            readonly "tts.elevenlabs.apiKey": {
                readonly label: "ElevenLabs API Key";
                readonly sensitive: true;
                readonly advanced: true;
            };
            readonly "tts.elevenlabs.baseUrl": {
                readonly label: "ElevenLabs Base URL";
                readonly advanced: true;
            };
            readonly publicUrl: {
                readonly label: "Public Webhook URL";
                readonly advanced: true;
            };
            readonly skipSignatureVerification: {
                readonly label: "Skip Signature Verification";
                readonly advanced: true;
            };
            readonly store: {
                readonly label: "Call Log Store Path";
                readonly advanced: true;
            };
            readonly responseModel: {
                readonly label: "Response Model";
                readonly advanced: true;
            };
            readonly responseSystemPrompt: {
                readonly label: "Response System Prompt";
                readonly advanced: true;
            };
            readonly responseTimeoutMs: {
                readonly label: "Response Timeout (ms)";
                readonly advanced: true;
            };
        };
    };
}, {
    readonly dirName: "volcengine";
    readonly idHint: "volcengine";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/volcengine-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Volcengine provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "volcengine";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["volcengine", "volcengine-plan"];
        readonly providerAuthEnvVars: {
            readonly volcengine: readonly ["VOLCANO_ENGINE_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "volcengine";
            readonly method: "api-key";
            readonly choiceId: "volcengine-api-key";
            readonly choiceLabel: "Volcano Engine API key";
            readonly groupId: "volcengine";
            readonly groupLabel: "Volcano Engine";
            readonly groupHint: "API key";
            readonly optionKey: "volcengineApiKey";
            readonly cliFlag: "--volcengine-api-key";
            readonly cliOption: "--volcengine-api-key <key>";
            readonly cliDescription: "Volcano Engine API key";
        }];
    };
}, {
    readonly dirName: "whatsapp";
    readonly idHint: "whatsapp";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/whatsapp";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw WhatsApp channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "whatsapp";
            readonly label: "WhatsApp";
            readonly selectionLabel: "WhatsApp (QR link)";
            readonly detailLabel: "WhatsApp Web";
            readonly docsPath: "/channels/whatsapp";
            readonly docsLabel: "whatsapp";
            readonly blurb: "works with your own number; recommend a separate phone + eSIM.";
            readonly systemImage: "message";
        };
        readonly install: {
            readonly npmSpec: "@openclaw/whatsapp";
            readonly localPath: "extensions/whatsapp";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "whatsapp";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["whatsapp"];
    };
}, {
    readonly dirName: "xai";
    readonly idHint: "xai-plugin";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/xai-plugin";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw xAI plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "xai";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {
                readonly webSearch: {
                    readonly type: "object";
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly apiKey: {
                            readonly type: readonly ["string", "object"];
                        };
                        readonly model: {
                            readonly type: "string";
                        };
                        readonly inlineCitations: {
                            readonly type: "boolean";
                        };
                    };
                };
            };
        };
        readonly providers: readonly ["xai"];
        readonly providerAuthEnvVars: {
            readonly xai: readonly ["XAI_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "xai";
            readonly method: "api-key";
            readonly choiceId: "xai-api-key";
            readonly choiceLabel: "xAI API key";
            readonly groupId: "xai";
            readonly groupLabel: "xAI (Grok)";
            readonly groupHint: "API key";
            readonly optionKey: "xaiApiKey";
            readonly cliFlag: "--xai-api-key";
            readonly cliOption: "--xai-api-key <key>";
            readonly cliDescription: "xAI API key";
        }];
        readonly uiHints: {
            readonly "webSearch.apiKey": {
                readonly label: "Grok Search API Key";
                readonly help: "xAI API key for Grok web search (fallback: XAI_API_KEY env var).";
                readonly sensitive: true;
            };
            readonly "webSearch.model": {
                readonly label: "Grok Search Model";
                readonly help: "Grok model override for web search.";
            };
            readonly "webSearch.inlineCitations": {
                readonly label: "Inline Citations";
                readonly help: "Include inline markdown citations in Grok responses.";
            };
        };
    };
}, {
    readonly dirName: "xiaomi";
    readonly idHint: "xiaomi";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/xiaomi-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Xiaomi provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "xiaomi";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["xiaomi"];
        readonly providerAuthEnvVars: {
            readonly xiaomi: readonly ["XIAOMI_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "xiaomi";
            readonly method: "api-key";
            readonly choiceId: "xiaomi-api-key";
            readonly choiceLabel: "Xiaomi API key";
            readonly groupId: "xiaomi";
            readonly groupLabel: "Xiaomi";
            readonly groupHint: "API key";
            readonly optionKey: "xiaomiApiKey";
            readonly cliFlag: "--xiaomi-api-key";
            readonly cliOption: "--xiaomi-api-key <key>";
            readonly cliDescription: "Xiaomi API key";
        }];
    };
}, {
    readonly dirName: "zai";
    readonly idHint: "zai";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly packageName: "@openclaw/zai-provider";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Z.AI provider plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
    };
    readonly manifest: {
        readonly id: "zai";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly providers: readonly ["zai"];
        readonly providerAuthEnvVars: {
            readonly zai: readonly ["ZAI_API_KEY", "Z_AI_API_KEY"];
        };
        readonly providerAuthChoices: readonly [{
            readonly provider: "zai";
            readonly method: "api-key";
            readonly choiceId: "zai-api-key";
            readonly choiceLabel: "Z.AI API key";
            readonly groupId: "zai";
            readonly groupLabel: "Z.AI";
            readonly groupHint: "GLM Coding Plan / Global / CN";
            readonly optionKey: "zaiApiKey";
            readonly cliFlag: "--zai-api-key";
            readonly cliOption: "--zai-api-key <key>";
            readonly cliDescription: "Z.AI API key";
        }, {
            readonly provider: "zai";
            readonly method: "coding-global";
            readonly choiceId: "zai-coding-global";
            readonly choiceLabel: "Coding-Plan-Global";
            readonly choiceHint: "GLM Coding Plan Global (api.z.ai)";
            readonly groupId: "zai";
            readonly groupLabel: "Z.AI";
            readonly groupHint: "GLM Coding Plan / Global / CN";
            readonly optionKey: "zaiApiKey";
            readonly cliFlag: "--zai-api-key";
            readonly cliOption: "--zai-api-key <key>";
            readonly cliDescription: "Z.AI API key";
        }, {
            readonly provider: "zai";
            readonly method: "coding-cn";
            readonly choiceId: "zai-coding-cn";
            readonly choiceLabel: "Coding-Plan-CN";
            readonly choiceHint: "GLM Coding Plan CN (open.bigmodel.cn)";
            readonly groupId: "zai";
            readonly groupLabel: "Z.AI";
            readonly groupHint: "GLM Coding Plan / Global / CN";
            readonly optionKey: "zaiApiKey";
            readonly cliFlag: "--zai-api-key";
            readonly cliOption: "--zai-api-key <key>";
            readonly cliDescription: "Z.AI API key";
        }, {
            readonly provider: "zai";
            readonly method: "global";
            readonly choiceId: "zai-global";
            readonly choiceLabel: "Global";
            readonly choiceHint: "Z.AI Global (api.z.ai)";
            readonly groupId: "zai";
            readonly groupLabel: "Z.AI";
            readonly groupHint: "GLM Coding Plan / Global / CN";
            readonly optionKey: "zaiApiKey";
            readonly cliFlag: "--zai-api-key";
            readonly cliOption: "--zai-api-key <key>";
            readonly cliDescription: "Z.AI API key";
        }, {
            readonly provider: "zai";
            readonly method: "cn";
            readonly choiceId: "zai-cn";
            readonly choiceLabel: "CN";
            readonly choiceHint: "Z.AI CN (open.bigmodel.cn)";
            readonly groupId: "zai";
            readonly groupLabel: "Z.AI";
            readonly groupHint: "GLM Coding Plan / Global / CN";
            readonly optionKey: "zaiApiKey";
            readonly cliFlag: "--zai-api-key";
            readonly cliOption: "--zai-api-key <key>";
            readonly cliDescription: "Z.AI API key";
        }];
    };
}, {
    readonly dirName: "zalo";
    readonly idHint: "zalo";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/zalo";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Zalo channel plugin";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "zalo";
            readonly label: "Zalo";
            readonly selectionLabel: "Zalo (Bot API)";
            readonly docsPath: "/channels/zalo";
            readonly docsLabel: "zalo";
            readonly blurb: "Vietnam-focused messaging platform with Bot API.";
            readonly aliases: readonly ["zl"];
            readonly order: 80;
            readonly quickstartAllowFrom: true;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/zalo";
            readonly localPath: "extensions/zalo";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "zalo";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["zalo"];
    };
}, {
    readonly dirName: "zalouser";
    readonly idHint: "zalouser";
    readonly source: {
        readonly source: "./index.ts";
        readonly built: "index.js";
    };
    readonly setupSource: {
        readonly source: "./setup-entry.ts";
        readonly built: "setup-entry.js";
    };
    readonly packageName: "@openclaw/zalouser";
    readonly packageVersion: "2026.3.22";
    readonly packageDescription: "OpenClaw Zalo Personal Account plugin via native zca-js integration";
    readonly packageManifest: {
        readonly extensions: readonly ["./index.ts"];
        readonly setupEntry: "./setup-entry.ts";
        readonly channel: {
            readonly id: "zalouser";
            readonly label: "Zalo Personal";
            readonly selectionLabel: "Zalo (Personal Account)";
            readonly docsPath: "/channels/zalouser";
            readonly docsLabel: "zalouser";
            readonly blurb: "Zalo personal account via QR code login.";
            readonly aliases: readonly ["zlu"];
            readonly order: 85;
            readonly quickstartAllowFrom: false;
        };
        readonly install: {
            readonly npmSpec: "@openclaw/zalouser";
            readonly localPath: "extensions/zalouser";
            readonly defaultChoice: "npm";
            readonly minHostVersion: ">=2026.3.22";
        };
    };
    readonly manifest: {
        readonly id: "zalouser";
        readonly configSchema: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly properties: {};
        };
        readonly channels: readonly ["zalouser"];
    };
}];
