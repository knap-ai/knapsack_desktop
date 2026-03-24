import { g as resolveConfigDir, y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { i as openBoundaryFileSync, n as matchBoundaryFileOpenFailure } from "./boundary-file-read-DcZxlWD8.js";
import { n as resolveOpenClawPackageRootSync } from "./openclaw-root-DqTSxvim.js";
import { o as resolveRuntimeServiceVersion } from "./version-CD3oP1-d.js";
import { a as normalizePluginsConfig } from "./config-state-Br0ucqMb.js";
import { a as safeStatSync, g as resolvePackageExtensionEntries, h as loadPluginManifest, i as safeRealpathSync, l as detectBundleManifestFormat, m as getPackageManifestMetadata, n as formatPosixMode, p as DEFAULT_PLUGIN_ENTRY_CANDIDATES, r as isPathInside, t as checkMinHostVersion, u as loadBundleManifest } from "./min-host-version-RMBWtIAR.js";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
//#endregion
//#region src/plugins/bundled-plugin-metadata.ts
const BUNDLED_PLUGIN_METADATA = [
	{
		dirName: "acpx",
		idHint: "acpx",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/acpx",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw ACP runtime backend via acpx",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "acpx",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {
					command: { type: "string" },
					expectedVersion: { type: "string" },
					cwd: { type: "string" },
					permissionMode: {
						type: "string",
						enum: [
							"approve-all",
							"approve-reads",
							"deny-all"
						]
					},
					nonInteractivePermissions: {
						type: "string",
						enum: ["deny", "fail"]
					},
					strictWindowsCmdWrapper: { type: "boolean" },
					timeoutSeconds: {
						type: "number",
						minimum: .001
					},
					queueOwnerTtlSeconds: {
						type: "number",
						minimum: 0
					},
					mcpServers: {
						type: "object",
						additionalProperties: {
							type: "object",
							properties: {
								command: {
									type: "string",
									description: "Command to run the MCP server"
								},
								args: {
									type: "array",
									items: { type: "string" },
									description: "Arguments to pass to the command"
								},
								env: {
									type: "object",
									additionalProperties: { type: "string" },
									description: "Environment variables for the MCP server"
								}
							},
							required: ["command"]
						}
					}
				}
			},
			skills: ["./skills"],
			name: "ACPX Runtime",
			description: "ACP runtime backend powered by acpx with configurable command path and version policy.",
			uiHints: {
				command: {
					label: "acpx Command",
					help: "Optional path/command override for acpx (for example /home/user/repos/acpx/dist/cli.js). Leave unset to use plugin-local bundled acpx."
				},
				expectedVersion: {
					label: "Expected acpx Version",
					help: "Exact version to enforce or \"any\" to skip strict version matching."
				},
				cwd: {
					label: "Default Working Directory",
					help: "Default cwd for ACP session operations when not set per session."
				},
				permissionMode: {
					label: "Permission Mode",
					help: "Default acpx permission policy for runtime prompts."
				},
				nonInteractivePermissions: {
					label: "Non-Interactive Permission Policy",
					help: "acpx policy when interactive permission prompts are unavailable."
				},
				strictWindowsCmdWrapper: {
					label: "Strict Windows cmd Wrapper",
					help: "Enabled by default. On Windows, reject unresolved .cmd/.bat wrappers instead of shell fallback. Disable only for compatibility with non-standard wrappers.",
					advanced: true
				},
				timeoutSeconds: {
					label: "Prompt Timeout Seconds",
					help: "Optional acpx timeout for each runtime turn.",
					advanced: true
				},
				queueOwnerTtlSeconds: {
					label: "Queue Owner TTL Seconds",
					help: "Idle queue-owner TTL for acpx prompt turns. Keep this short in OpenClaw to avoid delayed completion after each turn.",
					advanced: true
				},
				mcpServers: {
					label: "MCP Servers",
					help: "Named MCP server definitions to inject into ACPX-backed session bootstrap. Each entry needs a command and can include args and env.",
					advanced: true
				}
			}
		}
	},
	{
		dirName: "amazon-bedrock",
		idHint: "amazon-bedrock",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/amazon-bedrock-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Amazon Bedrock provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "amazon-bedrock",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["amazon-bedrock"]
		}
	},
	{
		dirName: "anthropic",
		idHint: "anthropic",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/anthropic-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Anthropic provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "anthropic",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["anthropic"],
			providerAuthEnvVars: { anthropic: ["ANTHROPIC_OAUTH_TOKEN", "ANTHROPIC_API_KEY"] },
			providerAuthChoices: [{
				provider: "anthropic",
				method: "setup-token",
				choiceId: "token",
				choiceLabel: "Anthropic token (paste setup-token)",
				choiceHint: "Run `claude setup-token` elsewhere, then paste the token here",
				groupId: "anthropic",
				groupLabel: "Anthropic",
				groupHint: "setup-token + API key"
			}, {
				provider: "anthropic",
				method: "api-key",
				choiceId: "apiKey",
				choiceLabel: "Anthropic API key",
				groupId: "anthropic",
				groupLabel: "Anthropic",
				groupHint: "setup-token + API key",
				optionKey: "anthropicApiKey",
				cliFlag: "--anthropic-api-key",
				cliOption: "--anthropic-api-key <key>",
				cliDescription: "Anthropic API key"
			}]
		}
	},
	{
		dirName: "bluebubbles",
		idHint: "bluebubbles",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/bluebubbles",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw BlueBubbles channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "bluebubbles",
				label: "BlueBubbles",
				selectionLabel: "BlueBubbles (macOS app)",
				detailLabel: "BlueBubbles",
				docsPath: "/channels/bluebubbles",
				docsLabel: "bluebubbles",
				blurb: "iMessage via the BlueBubbles mac app + REST API.",
				aliases: ["bb"],
				preferOver: ["imessage"],
				systemImage: "bubble.left.and.text.bubble.right",
				order: 75
			},
			install: {
				npmSpec: "@openclaw/bluebubbles",
				localPath: "extensions/bluebubbles",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "bluebubbles",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["bluebubbles"]
		}
	},
	{
		dirName: "brave",
		idHint: "brave-plugin",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/brave-plugin",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Brave plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "brave",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: { webSearch: {
					type: "object",
					additionalProperties: false,
					properties: {
						apiKey: { type: ["string", "object"] },
						mode: {
							type: "string",
							enum: ["web", "llm-context"]
						}
					}
				} }
			},
			providerAuthEnvVars: { brave: ["BRAVE_API_KEY"] },
			uiHints: {
				"webSearch.apiKey": {
					label: "Brave Search API Key",
					help: "Brave Search API key (fallback: BRAVE_API_KEY env var).",
					sensitive: true,
					placeholder: "BSA..."
				},
				"webSearch.mode": {
					label: "Brave Search Mode",
					help: "Brave Search mode: web or llm-context."
				}
			}
		}
	},
	{
		dirName: "byteplus",
		idHint: "byteplus",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/byteplus-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw BytePlus provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "byteplus",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["byteplus", "byteplus-plan"],
			providerAuthEnvVars: { byteplus: ["BYTEPLUS_API_KEY"] },
			providerAuthChoices: [{
				provider: "byteplus",
				method: "api-key",
				choiceId: "byteplus-api-key",
				choiceLabel: "BytePlus API key",
				groupId: "byteplus",
				groupLabel: "BytePlus",
				groupHint: "API key",
				optionKey: "byteplusApiKey",
				cliFlag: "--byteplus-api-key",
				cliOption: "--byteplus-api-key <key>",
				cliDescription: "BytePlus API key"
			}]
		}
	},
	{
		dirName: "chutes",
		idHint: "chutes",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/chutes-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Chutes.ai provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "chutes",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			enabledByDefault: true,
			providers: ["chutes"],
			providerAuthEnvVars: { chutes: ["CHUTES_API_KEY", "CHUTES_OAUTH_TOKEN"] },
			providerAuthChoices: [{
				provider: "chutes",
				method: "oauth",
				choiceId: "chutes",
				choiceLabel: "Chutes (OAuth)",
				choiceHint: "Browser sign-in",
				groupId: "chutes",
				groupLabel: "Chutes",
				groupHint: "OAuth + API key"
			}, {
				provider: "chutes",
				method: "api-key",
				choiceId: "chutes-api-key",
				choiceLabel: "Chutes API key",
				choiceHint: "Open-source models including Llama, DeepSeek, and more",
				groupId: "chutes",
				groupLabel: "Chutes",
				groupHint: "OAuth + API key",
				optionKey: "chutesApiKey",
				cliFlag: "--chutes-api-key",
				cliOption: "--chutes-api-key <key>",
				cliDescription: "Chutes API key"
			}]
		}
	},
	{
		dirName: "cloudflare-ai-gateway",
		idHint: "cloudflare-ai-gateway",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/cloudflare-ai-gateway-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Cloudflare AI Gateway provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "cloudflare-ai-gateway",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["cloudflare-ai-gateway"],
			providerAuthEnvVars: { "cloudflare-ai-gateway": ["CLOUDFLARE_AI_GATEWAY_API_KEY"] },
			providerAuthChoices: [{
				provider: "cloudflare-ai-gateway",
				method: "api-key",
				choiceId: "cloudflare-ai-gateway-api-key",
				choiceLabel: "Cloudflare AI Gateway",
				choiceHint: "Account ID + Gateway ID + API key",
				groupId: "cloudflare-ai-gateway",
				groupLabel: "Cloudflare AI Gateway",
				groupHint: "Account ID + Gateway ID + API key",
				optionKey: "cloudflareAiGatewayApiKey",
				cliFlag: "--cloudflare-ai-gateway-api-key",
				cliOption: "--cloudflare-ai-gateway-api-key <key>",
				cliDescription: "Cloudflare AI Gateway API key"
			}]
		}
	},
	{
		dirName: "copilot-proxy",
		idHint: "copilot-proxy",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/copilot-proxy",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Copilot Proxy provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "copilot-proxy",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["copilot-proxy"],
			providerAuthChoices: [{
				provider: "copilot-proxy",
				method: "local",
				choiceId: "copilot-proxy",
				choiceLabel: "Copilot Proxy",
				choiceHint: "Configure base URL + model ids",
				groupId: "copilot",
				groupLabel: "Copilot",
				groupHint: "GitHub + local proxy"
			}]
		}
	},
	{
		dirName: "deepgram",
		idHint: "deepgram",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/deepgram-provider",
		packageVersion: "2026.3.14",
		packageDescription: "OpenClaw Deepgram media-understanding provider",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "deepgram",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			}
		}
	},
	{
		dirName: "deepseek",
		idHint: "deepseek",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/deepseek-provider",
		packageVersion: "2026.3.14",
		packageDescription: "OpenClaw DeepSeek provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "deepseek",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["deepseek"],
			providerAuthEnvVars: { deepseek: ["DEEPSEEK_API_KEY"] },
			providerAuthChoices: [{
				provider: "deepseek",
				method: "api-key",
				choiceId: "deepseek-api-key",
				choiceLabel: "DeepSeek API key",
				groupId: "deepseek",
				groupLabel: "DeepSeek",
				groupHint: "API key",
				optionKey: "deepseekApiKey",
				cliFlag: "--deepseek-api-key",
				cliOption: "--deepseek-api-key <key>",
				cliDescription: "DeepSeek API key"
			}]
		}
	},
	{
		dirName: "diagnostics-otel",
		idHint: "diagnostics-otel",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/diagnostics-otel",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw diagnostics OpenTelemetry exporter",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "diagnostics-otel",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			}
		}
	},
	{
		dirName: "diffs",
		idHint: "diffs",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/diffs",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw diff viewer plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "diffs",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {
					defaults: {
						type: "object",
						additionalProperties: false,
						properties: {
							fontFamily: {
								type: "string",
								default: "Fira Code"
							},
							fontSize: {
								type: "number",
								minimum: 10,
								maximum: 24,
								default: 15
							},
							lineSpacing: {
								type: "number",
								minimum: 1,
								maximum: 3,
								default: 1.6
							},
							layout: {
								type: "string",
								enum: ["unified", "split"],
								default: "unified"
							},
							showLineNumbers: {
								type: "boolean",
								default: true
							},
							diffIndicators: {
								type: "string",
								enum: [
									"bars",
									"classic",
									"none"
								],
								default: "bars"
							},
							wordWrap: {
								type: "boolean",
								default: true
							},
							background: {
								type: "boolean",
								default: true
							},
							theme: {
								type: "string",
								enum: ["light", "dark"],
								default: "dark"
							},
							fileFormat: {
								type: "string",
								enum: ["png", "pdf"],
								default: "png"
							},
							format: {
								type: "string",
								enum: ["png", "pdf"]
							},
							fileQuality: {
								type: "string",
								enum: [
									"standard",
									"hq",
									"print"
								],
								default: "standard"
							},
							fileScale: {
								type: "number",
								minimum: 1,
								maximum: 4,
								default: 2
							},
							fileMaxWidth: {
								type: "number",
								minimum: 640,
								maximum: 2400,
								default: 960
							},
							imageFormat: {
								type: "string",
								enum: ["png", "pdf"]
							},
							imageQuality: {
								type: "string",
								enum: [
									"standard",
									"hq",
									"print"
								]
							},
							imageScale: {
								type: "number",
								minimum: 1,
								maximum: 4
							},
							imageMaxWidth: {
								type: "number",
								minimum: 640,
								maximum: 2400
							},
							mode: {
								type: "string",
								enum: [
									"view",
									"image",
									"file",
									"both"
								],
								default: "both"
							}
						}
					},
					security: {
						type: "object",
						additionalProperties: false,
						properties: { allowRemoteViewer: {
							type: "boolean",
							default: false
						} }
					}
				}
			},
			skills: ["./skills"],
			name: "Diffs",
			description: "Read-only diff viewer and file renderer for agents.",
			uiHints: {
				"defaults.fontFamily": {
					label: "Default Font",
					help: "Preferred font family name for diff content and headers."
				},
				"defaults.fontSize": {
					label: "Default Font Size",
					help: "Base diff font size in pixels."
				},
				"defaults.lineSpacing": {
					label: "Default Line Spacing",
					help: "Line-height multiplier applied to diff rows."
				},
				"defaults.layout": {
					label: "Default Layout",
					help: "Initial diff layout shown in the viewer."
				},
				"defaults.showLineNumbers": {
					label: "Show Line Numbers",
					help: "Show line numbers by default."
				},
				"defaults.diffIndicators": {
					label: "Diff Indicator Style",
					help: "Choose added/removed indicators style."
				},
				"defaults.wordWrap": {
					label: "Default Word Wrap",
					help: "Wrap long lines by default."
				},
				"defaults.background": {
					label: "Default Background Highlights",
					help: "Show added/removed background highlights by default."
				},
				"defaults.theme": {
					label: "Default Theme",
					help: "Initial viewer theme."
				},
				"defaults.fileFormat": {
					label: "Default File Format",
					help: "Rendered file format for file mode (PNG or PDF)."
				},
				"defaults.fileQuality": {
					label: "Default File Quality",
					help: "Quality preset for PNG/PDF rendering."
				},
				"defaults.fileScale": {
					label: "Default File Scale",
					help: "Device scale factor used while rendering file artifacts."
				},
				"defaults.fileMaxWidth": {
					label: "Default File Max Width",
					help: "Maximum file render width in CSS pixels."
				},
				"defaults.mode": {
					label: "Default Output Mode",
					help: "Tool default when mode is omitted. Use view for canvas/gateway viewer, file for PNG/PDF, or both."
				},
				"security.allowRemoteViewer": {
					label: "Allow Remote Viewer",
					help: "Allow non-loopback access to diff viewer URLs when the token path is known."
				}
			}
		}
	},
	{
		dirName: "discord",
		idHint: "discord",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/discord",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Discord channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "discord",
				label: "Discord",
				selectionLabel: "Discord (Bot API)",
				detailLabel: "Discord Bot",
				docsPath: "/channels/discord",
				docsLabel: "discord",
				blurb: "very well supported right now.",
				systemImage: "bubble.left.and.bubble.right"
			},
			install: {
				npmSpec: "@openclaw/discord",
				localPath: "extensions/discord",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "discord",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["discord"]
		}
	},
	{
		dirName: "duckduckgo",
		idHint: "duckduckgo-plugin",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/duckduckgo-plugin",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw DuckDuckGo plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "duckduckgo",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: { webSearch: {
					type: "object",
					additionalProperties: false,
					properties: {
						region: { type: "string" },
						safeSearch: {
							type: "string",
							enum: [
								"strict",
								"moderate",
								"off"
							]
						}
					}
				} }
			},
			uiHints: {
				"webSearch.region": {
					label: "DuckDuckGo Region",
					help: "Optional DuckDuckGo region code such as us-en, uk-en, or de-de."
				},
				"webSearch.safeSearch": {
					label: "DuckDuckGo SafeSearch",
					help: "SafeSearch level for DuckDuckGo results."
				}
			}
		}
	},
	{
		dirName: "elevenlabs",
		idHint: "elevenlabs",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/elevenlabs-speech",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw ElevenLabs speech plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "elevenlabs",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			}
		}
	},
	{
		dirName: "exa",
		idHint: "exa-plugin",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/exa-plugin",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Exa plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "exa",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: { webSearch: {
					type: "object",
					additionalProperties: false,
					properties: { apiKey: { type: ["string", "object"] } }
				} }
			},
			providerAuthEnvVars: { exa: ["EXA_API_KEY"] },
			uiHints: { "webSearch.apiKey": {
				label: "Exa API Key",
				help: "Exa Search API key (fallback: EXA_API_KEY env var).",
				sensitive: true,
				placeholder: "exa-..."
			} }
		}
	},
	{
		dirName: "fal",
		idHint: "fal",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/fal-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw fal provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "fal",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["fal"],
			providerAuthEnvVars: { fal: ["FAL_KEY"] },
			providerAuthChoices: [{
				provider: "fal",
				method: "api-key",
				choiceId: "fal-api-key",
				choiceLabel: "fal API key",
				groupId: "fal",
				groupLabel: "fal",
				groupHint: "Image generation",
				onboardingScopes: ["image-generation"],
				optionKey: "falApiKey",
				cliFlag: "--fal-api-key",
				cliOption: "--fal-api-key <key>",
				cliDescription: "fal API key"
			}]
		}
	},
	{
		dirName: "feishu",
		idHint: "feishu",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/feishu",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Feishu/Lark channel plugin (community maintained by @m1heng)",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "feishu",
				label: "Feishu",
				selectionLabel: "Feishu/Lark (飞书)",
				docsPath: "/channels/feishu",
				docsLabel: "feishu",
				blurb: "飞书/Lark enterprise messaging with doc/wiki/drive tools.",
				aliases: ["lark"],
				order: 35,
				quickstartAllowFrom: true
			},
			install: {
				npmSpec: "@openclaw/feishu",
				localPath: "extensions/feishu",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "feishu",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["feishu"],
			skills: ["./skills"]
		}
	},
	{
		dirName: "firecrawl",
		idHint: "firecrawl-plugin",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/firecrawl-plugin",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Firecrawl plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "firecrawl",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: { webSearch: {
					type: "object",
					additionalProperties: false,
					properties: {
						apiKey: { type: ["string", "object"] },
						baseUrl: { type: "string" }
					}
				} }
			},
			providerAuthEnvVars: { firecrawl: ["FIRECRAWL_API_KEY"] },
			uiHints: {
				"webSearch.apiKey": {
					label: "Firecrawl Search API Key",
					help: "Firecrawl API key for web search (fallback: FIRECRAWL_API_KEY env var).",
					sensitive: true,
					placeholder: "fc-..."
				},
				"webSearch.baseUrl": {
					label: "Firecrawl Search Base URL",
					help: "Firecrawl Search base URL override."
				}
			}
		}
	},
	{
		dirName: "github-copilot",
		idHint: "github-copilot",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/github-copilot-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw GitHub Copilot provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "github-copilot",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["github-copilot"],
			providerAuthEnvVars: { "github-copilot": [
				"COPILOT_GITHUB_TOKEN",
				"GH_TOKEN",
				"GITHUB_TOKEN"
			] },
			providerAuthChoices: [{
				provider: "github-copilot",
				method: "device",
				choiceId: "github-copilot",
				choiceLabel: "GitHub Copilot",
				choiceHint: "Device login with your GitHub account",
				groupId: "copilot",
				groupLabel: "Copilot",
				groupHint: "GitHub + local proxy"
			}]
		}
	},
	{
		dirName: "google",
		idHint: "google-plugin",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/google-plugin",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Google plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "google",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: { webSearch: {
					type: "object",
					additionalProperties: false,
					properties: {
						apiKey: { type: ["string", "object"] },
						model: { type: "string" }
					}
				} }
			},
			providers: ["google", "google-gemini-cli"],
			providerAuthEnvVars: { google: ["GEMINI_API_KEY", "GOOGLE_API_KEY"] },
			providerAuthChoices: [{
				provider: "google",
				method: "api-key",
				choiceId: "gemini-api-key",
				choiceLabel: "Google Gemini API key",
				groupId: "google",
				groupLabel: "Google",
				groupHint: "Gemini API key + OAuth",
				optionKey: "geminiApiKey",
				cliFlag: "--gemini-api-key",
				cliOption: "--gemini-api-key <key>",
				cliDescription: "Gemini API key"
			}, {
				provider: "google-gemini-cli",
				method: "oauth",
				choiceId: "google-gemini-cli",
				choiceLabel: "Gemini CLI OAuth",
				choiceHint: "Google OAuth with project-aware token payload",
				groupId: "google",
				groupLabel: "Google",
				groupHint: "Gemini API key + OAuth"
			}],
			uiHints: {
				"webSearch.apiKey": {
					label: "Gemini Search API Key",
					help: "Gemini API key for Google Search grounding (fallback: GEMINI_API_KEY env var).",
					sensitive: true,
					placeholder: "AIza..."
				},
				"webSearch.model": {
					label: "Gemini Search Model",
					help: "Gemini model override for web search grounding."
				}
			}
		}
	},
	{
		dirName: "googlechat",
		idHint: "googlechat",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/googlechat",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Google Chat channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "googlechat",
				label: "Google Chat",
				selectionLabel: "Google Chat (Chat API)",
				detailLabel: "Google Chat",
				docsPath: "/channels/googlechat",
				docsLabel: "googlechat",
				blurb: "Google Workspace Chat app via HTTP webhooks.",
				aliases: ["gchat", "google-chat"],
				order: 55
			},
			install: {
				npmSpec: "@openclaw/googlechat",
				localPath: "extensions/googlechat",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "googlechat",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["googlechat"]
		}
	},
	{
		dirName: "groq",
		idHint: "groq",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/groq-provider",
		packageVersion: "2026.3.14",
		packageDescription: "OpenClaw Groq media-understanding provider",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "groq",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			}
		}
	},
	{
		dirName: "huggingface",
		idHint: "huggingface",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/huggingface-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Hugging Face provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "huggingface",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["huggingface"],
			providerAuthEnvVars: { huggingface: ["HUGGINGFACE_HUB_TOKEN", "HF_TOKEN"] },
			providerAuthChoices: [{
				provider: "huggingface",
				method: "api-key",
				choiceId: "huggingface-api-key",
				choiceLabel: "Hugging Face API key",
				choiceHint: "Inference API (HF token)",
				groupId: "huggingface",
				groupLabel: "Hugging Face",
				groupHint: "Inference API (HF token)",
				optionKey: "huggingfaceApiKey",
				cliFlag: "--huggingface-api-key",
				cliOption: "--huggingface-api-key <key>",
				cliDescription: "Hugging Face API key (HF token)"
			}]
		}
	},
	{
		dirName: "imessage",
		idHint: "imessage",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/imessage",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw iMessage channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "imessage",
				label: "iMessage",
				selectionLabel: "iMessage (imsg)",
				detailLabel: "iMessage",
				docsPath: "/channels/imessage",
				docsLabel: "imessage",
				blurb: "this is still a work in progress.",
				aliases: ["imsg"],
				systemImage: "message.fill"
			}
		},
		manifest: {
			id: "imessage",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["imessage"]
		}
	},
	{
		dirName: "irc",
		idHint: "irc",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/irc",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw IRC channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "irc",
				label: "IRC",
				selectionLabel: "IRC (Server + Nick)",
				detailLabel: "IRC",
				docsPath: "/channels/irc",
				docsLabel: "irc",
				blurb: "classic IRC networks with DM/channel routing and pairing controls.",
				systemImage: "network"
			},
			install: { minHostVersion: ">=2026.3.22" }
		},
		manifest: {
			id: "irc",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["irc"]
		}
	},
	{
		dirName: "kilocode",
		idHint: "kilocode",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/kilocode-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Kilo Gateway provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "kilocode",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["kilocode"],
			providerAuthEnvVars: { kilocode: ["KILOCODE_API_KEY"] },
			providerAuthChoices: [{
				provider: "kilocode",
				method: "api-key",
				choiceId: "kilocode-api-key",
				choiceLabel: "Kilo Gateway API key",
				choiceHint: "API key (OpenRouter-compatible)",
				groupId: "kilocode",
				groupLabel: "Kilo Gateway",
				groupHint: "API key (OpenRouter-compatible)",
				optionKey: "kilocodeApiKey",
				cliFlag: "--kilocode-api-key",
				cliOption: "--kilocode-api-key <key>",
				cliDescription: "Kilo Gateway API key"
			}]
		}
	},
	{
		dirName: "kimi-coding",
		idHint: "kimi",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/kimi-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Kimi provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "kimi",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["kimi", "kimi-coding"],
			providerAuthEnvVars: {
				kimi: ["KIMI_API_KEY", "KIMICODE_API_KEY"],
				"kimi-coding": ["KIMI_API_KEY", "KIMICODE_API_KEY"]
			},
			providerAuthChoices: [{
				provider: "kimi",
				method: "api-key",
				choiceId: "kimi-code-api-key",
				choiceLabel: "Kimi Code API key",
				groupId: "kimi-code",
				groupLabel: "Kimi Code",
				groupHint: "Dedicated coding endpoint",
				optionKey: "kimiCodeApiKey",
				cliFlag: "--kimi-code-api-key",
				cliOption: "--kimi-code-api-key <key>",
				cliDescription: "Kimi Code API key"
			}]
		}
	},
	{
		dirName: "line",
		idHint: "line",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/line",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw LINE channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "line",
				label: "LINE",
				selectionLabel: "LINE (Messaging API)",
				docsPath: "/channels/line",
				docsLabel: "line",
				blurb: "LINE Messaging API bot for Japan/Taiwan/Thailand markets.",
				order: 75,
				quickstartAllowFrom: true
			},
			install: {
				npmSpec: "@openclaw/line",
				localPath: "extensions/line",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "line",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["line"]
		}
	},
	{
		dirName: "llm-task",
		idHint: "llm-task",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/llm-task",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw JSON-only LLM task plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "llm-task",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {
					defaultProvider: { type: "string" },
					defaultModel: { type: "string" },
					defaultAuthProfileId: { type: "string" },
					allowedModels: {
						type: "array",
						items: { type: "string" },
						description: "Allowlist of provider/model keys like openai-codex/gpt-5.2."
					},
					maxTokens: { type: "number" },
					timeoutMs: { type: "number" }
				}
			},
			name: "LLM Task",
			description: "Generic JSON-only LLM tool for structured tasks callable from workflows."
		}
	},
	{
		dirName: "lobster",
		idHint: "lobster",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/lobster",
		packageVersion: "2026.3.22",
		packageDescription: "Lobster workflow tool plugin (typed pipelines + resumable approvals)",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "lobster",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			name: "Lobster",
			description: "Typed workflow tool with resumable approvals."
		}
	},
	{
		dirName: "matrix",
		idHint: "matrix",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/matrix",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Matrix channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "matrix",
				label: "Matrix",
				selectionLabel: "Matrix (plugin)",
				docsPath: "/channels/matrix",
				docsLabel: "matrix",
				blurb: "open protocol; install the plugin to enable.",
				order: 70,
				quickstartAllowFrom: true
			},
			install: {
				npmSpec: "@openclaw/matrix",
				localPath: "extensions/matrix",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "matrix",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["matrix"]
		}
	},
	{
		dirName: "mattermost",
		idHint: "mattermost",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/mattermost",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Mattermost channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "mattermost",
				label: "Mattermost",
				selectionLabel: "Mattermost (plugin)",
				docsPath: "/channels/mattermost",
				docsLabel: "mattermost",
				blurb: "self-hosted Slack-style chat; install the plugin to enable.",
				order: 65
			},
			install: {
				npmSpec: "@openclaw/mattermost",
				localPath: "extensions/mattermost",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "mattermost",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["mattermost"]
		}
	},
	{
		dirName: "memory-core",
		idHint: "memory-core",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/memory-core",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw core memory search plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "memory-core",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			kind: "memory"
		}
	},
	{
		dirName: "memory-lancedb",
		idHint: "memory-lancedb",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/memory-lancedb",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw LanceDB-backed long-term memory plugin with auto-recall/capture",
		packageManifest: {
			extensions: ["./index.ts"],
			install: {
				npmSpec: "@openclaw/memory-lancedb",
				localPath: "extensions/memory-lancedb",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "memory-lancedb",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {
					embedding: {
						type: "object",
						additionalProperties: false,
						properties: {
							apiKey: { type: "string" },
							model: { type: "string" },
							baseUrl: { type: "string" },
							dimensions: { type: "number" }
						},
						required: ["apiKey"]
					},
					dbPath: { type: "string" },
					autoCapture: { type: "boolean" },
					autoRecall: { type: "boolean" },
					captureMaxChars: {
						type: "number",
						minimum: 100,
						maximum: 1e4
					}
				},
				required: ["embedding"]
			},
			kind: "memory",
			uiHints: {
				"embedding.apiKey": {
					label: "OpenAI API Key",
					sensitive: true,
					placeholder: "sk-proj-...",
					help: "API key for OpenAI embeddings (or use ${OPENAI_API_KEY})"
				},
				"embedding.model": {
					label: "Embedding Model",
					placeholder: "text-embedding-3-small",
					help: "OpenAI embedding model to use"
				},
				"embedding.baseUrl": {
					label: "Base URL",
					placeholder: "https://api.openai.com/v1",
					help: "Base URL for compatible providers (e.g. http://localhost:11434/v1)",
					advanced: true
				},
				"embedding.dimensions": {
					label: "Dimensions",
					placeholder: "1536",
					help: "Vector dimensions for custom models (required for non-standard models)",
					advanced: true
				},
				dbPath: {
					label: "Database Path",
					placeholder: "~/.openclaw/memory/lancedb",
					advanced: true
				},
				autoCapture: {
					label: "Auto-Capture",
					help: "Automatically capture important information from conversations"
				},
				autoRecall: {
					label: "Auto-Recall",
					help: "Automatically inject relevant memories into context"
				},
				captureMaxChars: {
					label: "Capture Max Chars",
					help: "Maximum message length eligible for auto-capture",
					advanced: true,
					placeholder: "500"
				}
			}
		}
	},
	{
		dirName: "microsoft",
		idHint: "microsoft",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/microsoft-speech",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Microsoft speech plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "microsoft",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			}
		}
	},
	{
		dirName: "minimax",
		idHint: "minimax",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/minimax-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw MiniMax provider and OAuth plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "minimax",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["minimax", "minimax-portal"],
			providerAuthEnvVars: {
				minimax: ["MINIMAX_API_KEY"],
				"minimax-portal": ["MINIMAX_OAUTH_TOKEN", "MINIMAX_API_KEY"]
			},
			providerAuthChoices: [
				{
					provider: "minimax-portal",
					method: "oauth",
					choiceId: "minimax-global-oauth",
					choiceLabel: "MiniMax OAuth (Global)",
					choiceHint: "Global endpoint - api.minimax.io",
					groupId: "minimax",
					groupLabel: "MiniMax",
					groupHint: "M2.7 (recommended)"
				},
				{
					provider: "minimax",
					method: "api-global",
					choiceId: "minimax-global-api",
					choiceLabel: "MiniMax API key (Global)",
					choiceHint: "Global endpoint - api.minimax.io",
					groupId: "minimax",
					groupLabel: "MiniMax",
					groupHint: "M2.7 (recommended)",
					optionKey: "minimaxApiKey",
					cliFlag: "--minimax-api-key",
					cliOption: "--minimax-api-key <key>",
					cliDescription: "MiniMax API key"
				},
				{
					provider: "minimax-portal",
					method: "oauth-cn",
					choiceId: "minimax-cn-oauth",
					choiceLabel: "MiniMax OAuth (CN)",
					choiceHint: "CN endpoint - api.minimaxi.com",
					groupId: "minimax",
					groupLabel: "MiniMax",
					groupHint: "M2.7 (recommended)"
				},
				{
					provider: "minimax",
					method: "api-cn",
					choiceId: "minimax-cn-api",
					choiceLabel: "MiniMax API key (CN)",
					choiceHint: "CN endpoint - api.minimaxi.com",
					groupId: "minimax",
					groupLabel: "MiniMax",
					groupHint: "M2.7 (recommended)",
					optionKey: "minimaxApiKey",
					cliFlag: "--minimax-api-key",
					cliOption: "--minimax-api-key <key>",
					cliDescription: "MiniMax API key"
				}
			]
		}
	},
	{
		dirName: "mistral",
		idHint: "mistral",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/mistral-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Mistral provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "mistral",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["mistral"],
			providerAuthEnvVars: { mistral: ["MISTRAL_API_KEY"] },
			providerAuthChoices: [{
				provider: "mistral",
				method: "api-key",
				choiceId: "mistral-api-key",
				choiceLabel: "Mistral API key",
				groupId: "mistral",
				groupLabel: "Mistral AI",
				groupHint: "API key",
				optionKey: "mistralApiKey",
				cliFlag: "--mistral-api-key",
				cliOption: "--mistral-api-key <key>",
				cliDescription: "Mistral API key"
			}]
		}
	},
	{
		dirName: "modelstudio",
		idHint: "modelstudio",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/modelstudio-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Model Studio provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "modelstudio",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["modelstudio"],
			providerAuthEnvVars: { modelstudio: ["MODELSTUDIO_API_KEY"] },
			providerAuthChoices: [
				{
					provider: "modelstudio",
					method: "standard-api-key-cn",
					choiceId: "modelstudio-standard-api-key-cn",
					choiceLabel: "Standard API Key for China (pay-as-you-go)",
					choiceHint: "Endpoint: dashscope.aliyuncs.com",
					groupId: "modelstudio",
					groupLabel: "Qwen (Alibaba Cloud Model Studio)",
					groupHint: "Standard / Coding Plan (CN / Global)",
					optionKey: "modelstudioStandardApiKeyCn",
					cliFlag: "--modelstudio-standard-api-key-cn",
					cliOption: "--modelstudio-standard-api-key-cn <key>",
					cliDescription: "Alibaba Cloud Model Studio Standard API key (China)"
				},
				{
					provider: "modelstudio",
					method: "standard-api-key",
					choiceId: "modelstudio-standard-api-key",
					choiceLabel: "Standard API Key for Global/Intl (pay-as-you-go)",
					choiceHint: "Endpoint: dashscope-intl.aliyuncs.com",
					groupId: "modelstudio",
					groupLabel: "Qwen (Alibaba Cloud Model Studio)",
					groupHint: "Standard / Coding Plan (CN / Global)",
					optionKey: "modelstudioStandardApiKey",
					cliFlag: "--modelstudio-standard-api-key",
					cliOption: "--modelstudio-standard-api-key <key>",
					cliDescription: "Alibaba Cloud Model Studio Standard API key (Global/Intl)"
				},
				{
					provider: "modelstudio",
					method: "api-key-cn",
					choiceId: "modelstudio-api-key-cn",
					choiceLabel: "Coding Plan API Key for China (subscription)",
					choiceHint: "Endpoint: coding.dashscope.aliyuncs.com",
					groupId: "modelstudio",
					groupLabel: "Qwen (Alibaba Cloud Model Studio)",
					groupHint: "Standard / Coding Plan (CN / Global)",
					optionKey: "modelstudioApiKeyCn",
					cliFlag: "--modelstudio-api-key-cn",
					cliOption: "--modelstudio-api-key-cn <key>",
					cliDescription: "Alibaba Cloud Model Studio Coding Plan API key (China)"
				},
				{
					provider: "modelstudio",
					method: "api-key",
					choiceId: "modelstudio-api-key",
					choiceLabel: "Coding Plan API Key for Global/Intl (subscription)",
					choiceHint: "Endpoint: coding-intl.dashscope.aliyuncs.com",
					groupId: "modelstudio",
					groupLabel: "Qwen (Alibaba Cloud Model Studio)",
					groupHint: "Standard / Coding Plan (CN / Global)",
					optionKey: "modelstudioApiKey",
					cliFlag: "--modelstudio-api-key",
					cliOption: "--modelstudio-api-key <key>",
					cliDescription: "Alibaba Cloud Model Studio Coding Plan API key (Global/Intl)"
				}
			]
		}
	},
	{
		dirName: "moonshot",
		idHint: "moonshot",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/moonshot-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Moonshot provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "moonshot",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: { webSearch: {
					type: "object",
					additionalProperties: false,
					properties: {
						apiKey: { type: ["string", "object"] },
						baseUrl: { type: "string" },
						model: { type: "string" }
					}
				} }
			},
			providers: ["moonshot"],
			providerAuthEnvVars: { moonshot: ["MOONSHOT_API_KEY"] },
			providerAuthChoices: [{
				provider: "moonshot",
				method: "api-key",
				choiceId: "moonshot-api-key",
				choiceLabel: "Moonshot API key (.ai)",
				groupId: "moonshot",
				groupLabel: "Moonshot AI (Kimi K2.5)",
				groupHint: "Kimi K2.5",
				optionKey: "moonshotApiKey",
				cliFlag: "--moonshot-api-key",
				cliOption: "--moonshot-api-key <key>",
				cliDescription: "Moonshot API key"
			}, {
				provider: "moonshot",
				method: "api-key-cn",
				choiceId: "moonshot-api-key-cn",
				choiceLabel: "Moonshot API key (.cn)",
				groupId: "moonshot",
				groupLabel: "Moonshot AI (Kimi K2.5)",
				groupHint: "Kimi K2.5",
				optionKey: "moonshotApiKey",
				cliFlag: "--moonshot-api-key",
				cliOption: "--moonshot-api-key <key>",
				cliDescription: "Moonshot API key"
			}],
			uiHints: {
				"webSearch.apiKey": {
					label: "Kimi Search API Key",
					help: "Moonshot/Kimi API key (fallback: KIMI_API_KEY or MOONSHOT_API_KEY env var).",
					sensitive: true
				},
				"webSearch.baseUrl": {
					label: "Kimi Search Base URL",
					help: "Kimi base URL override."
				},
				"webSearch.model": {
					label: "Kimi Search Model",
					help: "Kimi model override."
				}
			}
		}
	},
	{
		dirName: "msteams",
		idHint: "msteams",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/msteams",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Microsoft Teams channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "msteams",
				label: "Microsoft Teams",
				selectionLabel: "Microsoft Teams (Bot Framework)",
				docsPath: "/channels/msteams",
				docsLabel: "msteams",
				blurb: "Bot Framework; enterprise support.",
				aliases: ["teams"],
				order: 60
			},
			install: {
				npmSpec: "@openclaw/msteams",
				localPath: "extensions/msteams",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "msteams",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["msteams"]
		}
	},
	{
		dirName: "nextcloud-talk",
		idHint: "nextcloud-talk",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/nextcloud-talk",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Nextcloud Talk channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "nextcloud-talk",
				label: "Nextcloud Talk",
				selectionLabel: "Nextcloud Talk (self-hosted)",
				docsPath: "/channels/nextcloud-talk",
				docsLabel: "nextcloud-talk",
				blurb: "Self-hosted chat via Nextcloud Talk webhook bots.",
				aliases: ["nc-talk", "nc"],
				order: 65,
				quickstartAllowFrom: true
			},
			install: {
				npmSpec: "@openclaw/nextcloud-talk",
				localPath: "extensions/nextcloud-talk",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "nextcloud-talk",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["nextcloud-talk"]
		}
	},
	{
		dirName: "nostr",
		idHint: "nostr",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/nostr",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Nostr channel plugin for NIP-04 encrypted DMs",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "nostr",
				label: "Nostr",
				selectionLabel: "Nostr (NIP-04 DMs)",
				docsPath: "/channels/nostr",
				docsLabel: "nostr",
				blurb: "Decentralized protocol; encrypted DMs via NIP-04.",
				order: 55,
				quickstartAllowFrom: true
			},
			install: {
				npmSpec: "@openclaw/nostr",
				localPath: "extensions/nostr",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "nostr",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["nostr"]
		}
	},
	{
		dirName: "nvidia",
		idHint: "nvidia",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/nvidia-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw NVIDIA provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "nvidia",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["nvidia"],
			providerAuthEnvVars: { nvidia: ["NVIDIA_API_KEY"] }
		}
	},
	{
		dirName: "ollama",
		idHint: "ollama",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/ollama-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Ollama provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "ollama",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["ollama"],
			providerAuthEnvVars: { ollama: ["OLLAMA_API_KEY"] },
			providerAuthChoices: [{
				provider: "ollama",
				method: "local",
				choiceId: "ollama",
				choiceLabel: "Ollama",
				choiceHint: "Cloud and local open models",
				groupId: "ollama",
				groupLabel: "Ollama",
				groupHint: "Cloud and local open models"
			}]
		}
	},
	{
		dirName: "open-prose",
		idHint: "open-prose",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/open-prose",
		packageVersion: "2026.3.22",
		packageDescription: "OpenProse VM skill pack plugin (slash command + telemetry).",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "open-prose",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			skills: ["./skills"],
			name: "OpenProse",
			description: "OpenProse VM skill pack with a /prose slash command."
		}
	},
	{
		dirName: "openai",
		idHint: "openai",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/openai-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw OpenAI provider plugins",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "openai",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["openai", "openai-codex"],
			providerAuthEnvVars: { openai: ["OPENAI_API_KEY"] },
			providerAuthChoices: [{
				provider: "openai-codex",
				method: "oauth",
				choiceId: "openai-codex",
				choiceLabel: "OpenAI Codex (ChatGPT OAuth)",
				choiceHint: "Browser sign-in",
				groupId: "openai",
				groupLabel: "OpenAI",
				groupHint: "Codex OAuth + API key"
			}, {
				provider: "openai",
				method: "api-key",
				choiceId: "openai-api-key",
				choiceLabel: "OpenAI API key",
				groupId: "openai",
				groupLabel: "OpenAI",
				groupHint: "Codex OAuth + API key",
				optionKey: "openaiApiKey",
				cliFlag: "--openai-api-key",
				cliOption: "--openai-api-key <key>",
				cliDescription: "OpenAI API key"
			}]
		}
	},
	{
		dirName: "opencode",
		idHint: "opencode",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/opencode-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw OpenCode Zen provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "opencode",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["opencode"],
			providerAuthEnvVars: { opencode: ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"] },
			providerAuthChoices: [{
				provider: "opencode",
				method: "api-key",
				choiceId: "opencode-zen",
				choiceLabel: "OpenCode Zen catalog",
				groupId: "opencode",
				groupLabel: "OpenCode",
				groupHint: "Shared API key for Zen + Go catalogs",
				optionKey: "opencodeZenApiKey",
				cliFlag: "--opencode-zen-api-key",
				cliOption: "--opencode-zen-api-key <key>",
				cliDescription: "OpenCode API key (Zen catalog)"
			}]
		}
	},
	{
		dirName: "opencode-go",
		idHint: "opencode-go",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/opencode-go-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw OpenCode Go provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "opencode-go",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["opencode-go"],
			providerAuthEnvVars: { "opencode-go": ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"] },
			providerAuthChoices: [{
				provider: "opencode-go",
				method: "api-key",
				choiceId: "opencode-go",
				choiceLabel: "OpenCode Go catalog",
				groupId: "opencode",
				groupLabel: "OpenCode",
				groupHint: "Shared API key for Zen + Go catalogs",
				optionKey: "opencodeGoApiKey",
				cliFlag: "--opencode-go-api-key",
				cliOption: "--opencode-go-api-key <key>",
				cliDescription: "OpenCode API key (Go catalog)"
			}]
		}
	},
	{
		dirName: "openrouter",
		idHint: "openrouter",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/openrouter-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw OpenRouter provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "openrouter",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["openrouter"],
			providerAuthEnvVars: { openrouter: ["OPENROUTER_API_KEY"] },
			providerAuthChoices: [{
				provider: "openrouter",
				method: "api-key",
				choiceId: "openrouter-api-key",
				choiceLabel: "OpenRouter API key",
				groupId: "openrouter",
				groupLabel: "OpenRouter",
				groupHint: "API key",
				optionKey: "openrouterApiKey",
				cliFlag: "--openrouter-api-key",
				cliOption: "--openrouter-api-key <key>",
				cliDescription: "OpenRouter API key"
			}]
		}
	},
	{
		dirName: "openshell",
		idHint: "openshell-sandbox",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/openshell-sandbox",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw OpenShell sandbox backend",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "openshell",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {
					command: { type: "string" },
					gateway: { type: "string" },
					gatewayEndpoint: { type: "string" },
					from: { type: "string" },
					policy: { type: "string" },
					providers: {
						type: "array",
						items: { type: "string" }
					},
					gpu: { type: "boolean" },
					autoProviders: { type: "boolean" },
					remoteWorkspaceDir: { type: "string" },
					remoteAgentWorkspaceDir: { type: "string" },
					timeoutSeconds: {
						type: "number",
						minimum: 1
					}
				}
			},
			name: "OpenShell Sandbox",
			description: "Sandbox backend powered by OpenShell with mirrored local workspaces and SSH-based command execution.",
			uiHints: {
				command: {
					label: "OpenShell Command",
					help: "Path or command name for the openshell CLI."
				},
				gateway: {
					label: "Gateway Name",
					help: "Optional OpenShell gateway name passed as --gateway."
				},
				gatewayEndpoint: {
					label: "Gateway Endpoint",
					help: "Optional OpenShell gateway endpoint passed as --gateway-endpoint."
				},
				from: {
					label: "Sandbox Source",
					help: "OpenShell sandbox source for first-time create. Defaults to openclaw."
				},
				policy: {
					label: "Policy File",
					help: "Optional path to a custom OpenShell sandbox policy YAML."
				},
				providers: {
					label: "Providers",
					help: "Provider names to attach when a sandbox is created."
				},
				gpu: {
					label: "GPU",
					help: "Request GPU resources when creating the sandbox.",
					advanced: true
				},
				autoProviders: {
					label: "Auto-create Providers",
					help: "When enabled, pass --auto-providers during sandbox create.",
					advanced: true
				},
				remoteWorkspaceDir: {
					label: "Remote Workspace Dir",
					help: "Primary writable workspace inside the OpenShell sandbox.",
					advanced: true
				},
				remoteAgentWorkspaceDir: {
					label: "Remote Agent Dir",
					help: "Mirror path for the real agent workspace when workspaceAccess is read-only.",
					advanced: true
				},
				timeoutSeconds: {
					label: "Command Timeout Seconds",
					help: "Timeout for openshell CLI operations such as create/upload/download.",
					advanced: true
				}
			}
		}
	},
	{
		dirName: "perplexity",
		idHint: "perplexity-plugin",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/perplexity-plugin",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Perplexity plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "perplexity",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: { webSearch: {
					type: "object",
					additionalProperties: false,
					properties: {
						apiKey: { type: ["string", "object"] },
						baseUrl: { type: "string" },
						model: { type: "string" }
					}
				} }
			},
			providerAuthEnvVars: { perplexity: ["PERPLEXITY_API_KEY", "OPENROUTER_API_KEY"] },
			uiHints: {
				"webSearch.apiKey": {
					label: "Perplexity API Key",
					help: "Perplexity or OpenRouter API key for web search.",
					sensitive: true,
					placeholder: "pplx-..."
				},
				"webSearch.baseUrl": {
					label: "Perplexity Base URL",
					help: "Optional Perplexity/OpenRouter chat-completions base URL override."
				},
				"webSearch.model": {
					label: "Perplexity Model",
					help: "Optional Sonar/OpenRouter model override."
				}
			}
		}
	},
	{
		dirName: "qianfan",
		idHint: "qianfan",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/qianfan-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Qianfan provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "qianfan",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["qianfan"],
			providerAuthEnvVars: { qianfan: ["QIANFAN_API_KEY"] },
			providerAuthChoices: [{
				provider: "qianfan",
				method: "api-key",
				choiceId: "qianfan-api-key",
				choiceLabel: "Qianfan API key",
				groupId: "qianfan",
				groupLabel: "Qianfan",
				groupHint: "API key",
				optionKey: "qianfanApiKey",
				cliFlag: "--qianfan-api-key",
				cliOption: "--qianfan-api-key <key>",
				cliDescription: "QIANFAN API key"
			}]
		}
	},
	{
		dirName: "sglang",
		idHint: "sglang",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/sglang-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw SGLang provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "sglang",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["sglang"],
			providerAuthEnvVars: { sglang: ["SGLANG_API_KEY"] },
			providerAuthChoices: [{
				provider: "sglang",
				method: "custom",
				choiceId: "sglang",
				choiceLabel: "SGLang",
				choiceHint: "Fast self-hosted OpenAI-compatible server",
				groupId: "sglang",
				groupLabel: "SGLang",
				groupHint: "Fast self-hosted server"
			}]
		}
	},
	{
		dirName: "signal",
		idHint: "signal",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/signal",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Signal channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "signal",
				label: "Signal",
				selectionLabel: "Signal (signal-cli)",
				detailLabel: "Signal REST",
				docsPath: "/channels/signal",
				docsLabel: "signal",
				blurb: "signal-cli linked device; more setup (David Reagans: \"Hop on Discord.\").",
				systemImage: "antenna.radiowaves.left.and.right"
			}
		},
		manifest: {
			id: "signal",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["signal"]
		}
	},
	{
		dirName: "slack",
		idHint: "slack",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/slack",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Slack channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "slack",
				label: "Slack",
				selectionLabel: "Slack (Socket Mode)",
				detailLabel: "Slack Bot",
				docsPath: "/channels/slack",
				docsLabel: "slack",
				blurb: "supported (Socket Mode).",
				systemImage: "number"
			}
		},
		manifest: {
			id: "slack",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["slack"]
		}
	},
	{
		dirName: "synology-chat",
		idHint: "synology-chat",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/synology-chat",
		packageVersion: "2026.3.22",
		packageDescription: "Synology Chat channel plugin for OpenClaw",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "synology-chat",
				label: "Synology Chat",
				selectionLabel: "Synology Chat (Webhook)",
				docsPath: "/channels/synology-chat",
				docsLabel: "synology-chat",
				blurb: "Connect your Synology NAS Chat to OpenClaw with full agent capabilities.",
				order: 90
			},
			install: {
				npmSpec: "@openclaw/synology-chat",
				localPath: "extensions/synology-chat",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "synology-chat",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["synology-chat"]
		}
	},
	{
		dirName: "synthetic",
		idHint: "synthetic",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/synthetic-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Synthetic provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "synthetic",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["synthetic"],
			providerAuthEnvVars: { synthetic: ["SYNTHETIC_API_KEY"] },
			providerAuthChoices: [{
				provider: "synthetic",
				method: "api-key",
				choiceId: "synthetic-api-key",
				choiceLabel: "Synthetic API key",
				groupId: "synthetic",
				groupLabel: "Synthetic",
				groupHint: "Anthropic-compatible (multi-model)",
				optionKey: "syntheticApiKey",
				cliFlag: "--synthetic-api-key",
				cliOption: "--synthetic-api-key <key>",
				cliDescription: "Synthetic API key"
			}]
		}
	},
	{
		dirName: "tavily",
		idHint: "tavily-plugin",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/tavily-plugin",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Tavily plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "tavily",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: { webSearch: {
					type: "object",
					additionalProperties: false,
					properties: {
						apiKey: { type: ["string", "object"] },
						baseUrl: { type: "string" }
					}
				} }
			},
			providerAuthEnvVars: { tavily: ["TAVILY_API_KEY"] },
			skills: ["./skills"],
			uiHints: {
				"webSearch.apiKey": {
					label: "Tavily API Key",
					help: "Tavily API key for web search and extraction (fallback: TAVILY_API_KEY env var).",
					sensitive: true,
					placeholder: "tvly-..."
				},
				"webSearch.baseUrl": {
					label: "Tavily Base URL",
					help: "Tavily API base URL override."
				}
			}
		}
	},
	{
		dirName: "telegram",
		idHint: "telegram",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/telegram",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Telegram channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "telegram",
				label: "Telegram",
				selectionLabel: "Telegram (Bot API)",
				detailLabel: "Telegram Bot",
				docsPath: "/channels/telegram",
				docsLabel: "telegram",
				blurb: "simplest way to get started — register a bot with @BotFather and get going.",
				systemImage: "paperplane"
			}
		},
		manifest: {
			id: "telegram",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["telegram"]
		}
	},
	{
		dirName: "tlon",
		idHint: "tlon",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/tlon",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Tlon/Urbit channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "tlon",
				label: "Tlon",
				selectionLabel: "Tlon (Urbit)",
				docsPath: "/channels/tlon",
				docsLabel: "tlon",
				blurb: "decentralized messaging on Urbit; install the plugin to enable.",
				order: 90,
				quickstartAllowFrom: true
			},
			install: {
				npmSpec: "@openclaw/tlon",
				localPath: "extensions/tlon",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "tlon",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["tlon"],
			skills: ["node_modules/@tloncorp/tlon-skill"]
		}
	},
	{
		dirName: "together",
		idHint: "together",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/together-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Together provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "together",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["together"],
			providerAuthEnvVars: { together: ["TOGETHER_API_KEY"] },
			providerAuthChoices: [{
				provider: "together",
				method: "api-key",
				choiceId: "together-api-key",
				choiceLabel: "Together AI API key",
				groupId: "together",
				groupLabel: "Together AI",
				groupHint: "API key",
				optionKey: "togetherApiKey",
				cliFlag: "--together-api-key",
				cliOption: "--together-api-key <key>",
				cliDescription: "Together AI API key"
			}]
		}
	},
	{
		dirName: "twitch",
		idHint: "twitch",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/twitch",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Twitch channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			channel: {
				id: "twitch",
				label: "Twitch",
				selectionLabel: "Twitch (Chat)",
				docsPath: "/channels/twitch",
				blurb: "Twitch chat integration",
				aliases: ["twitch-chat"]
			},
			install: { minHostVersion: ">=2026.3.22" }
		},
		manifest: {
			id: "twitch",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["twitch"]
		}
	},
	{
		dirName: "venice",
		idHint: "venice",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/venice-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Venice provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "venice",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["venice"],
			providerAuthEnvVars: { venice: ["VENICE_API_KEY"] },
			providerAuthChoices: [{
				provider: "venice",
				method: "api-key",
				choiceId: "venice-api-key",
				choiceLabel: "Venice AI API key",
				groupId: "venice",
				groupLabel: "Venice AI",
				groupHint: "Privacy-focused (uncensored models)",
				optionKey: "veniceApiKey",
				cliFlag: "--venice-api-key",
				cliOption: "--venice-api-key <key>",
				cliDescription: "Venice API key"
			}]
		}
	},
	{
		dirName: "vercel-ai-gateway",
		idHint: "vercel-ai-gateway",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/vercel-ai-gateway-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Vercel AI Gateway provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "vercel-ai-gateway",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["vercel-ai-gateway"],
			providerAuthEnvVars: { "vercel-ai-gateway": ["AI_GATEWAY_API_KEY"] },
			providerAuthChoices: [{
				provider: "vercel-ai-gateway",
				method: "api-key",
				choiceId: "ai-gateway-api-key",
				choiceLabel: "Vercel AI Gateway API key",
				groupId: "ai-gateway",
				groupLabel: "Vercel AI Gateway",
				groupHint: "API key",
				optionKey: "aiGatewayApiKey",
				cliFlag: "--ai-gateway-api-key",
				cliOption: "--ai-gateway-api-key <key>",
				cliDescription: "Vercel AI Gateway API key"
			}]
		}
	},
	{
		dirName: "vllm",
		idHint: "vllm",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/vllm-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw vLLM provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "vllm",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["vllm"],
			providerAuthEnvVars: { vllm: ["VLLM_API_KEY"] },
			providerAuthChoices: [{
				provider: "vllm",
				method: "custom",
				choiceId: "vllm",
				choiceLabel: "vLLM",
				choiceHint: "Local/self-hosted OpenAI-compatible server",
				groupId: "vllm",
				groupLabel: "vLLM",
				groupHint: "Local/self-hosted OpenAI-compatible"
			}]
		}
	},
	{
		dirName: "voice-call",
		idHint: "voice-call",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/voice-call",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw voice-call plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			install: { minHostVersion: ">=2026.3.22" }
		},
		manifest: {
			id: "voice-call",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {
					enabled: { type: "boolean" },
					provider: {
						type: "string",
						enum: [
							"telnyx",
							"twilio",
							"plivo",
							"mock"
						]
					},
					telnyx: {
						type: "object",
						additionalProperties: false,
						properties: {
							apiKey: { type: "string" },
							connectionId: { type: "string" },
							publicKey: { type: "string" }
						}
					},
					twilio: {
						type: "object",
						additionalProperties: false,
						properties: {
							accountSid: { type: "string" },
							authToken: { type: "string" }
						}
					},
					plivo: {
						type: "object",
						additionalProperties: false,
						properties: {
							authId: { type: "string" },
							authToken: { type: "string" }
						}
					},
					fromNumber: {
						type: "string",
						pattern: "^\\+[1-9]\\d{1,14}$"
					},
					toNumber: {
						type: "string",
						pattern: "^\\+[1-9]\\d{1,14}$"
					},
					inboundPolicy: {
						type: "string",
						enum: [
							"disabled",
							"allowlist",
							"pairing",
							"open"
						]
					},
					allowFrom: {
						type: "array",
						items: {
							type: "string",
							pattern: "^\\+[1-9]\\d{1,14}$"
						}
					},
					inboundGreeting: { type: "string" },
					outbound: {
						type: "object",
						additionalProperties: false,
						properties: {
							defaultMode: {
								type: "string",
								enum: ["notify", "conversation"]
							},
							notifyHangupDelaySec: {
								type: "integer",
								minimum: 0
							}
						}
					},
					maxDurationSeconds: {
						type: "integer",
						minimum: 1
					},
					staleCallReaperSeconds: {
						type: "integer",
						minimum: 0
					},
					silenceTimeoutMs: {
						type: "integer",
						minimum: 1
					},
					transcriptTimeoutMs: {
						type: "integer",
						minimum: 1
					},
					ringTimeoutMs: {
						type: "integer",
						minimum: 1
					},
					maxConcurrentCalls: {
						type: "integer",
						minimum: 1
					},
					serve: {
						type: "object",
						additionalProperties: false,
						properties: {
							port: {
								type: "integer",
								minimum: 1
							},
							bind: { type: "string" },
							path: { type: "string" }
						}
					},
					tailscale: {
						type: "object",
						additionalProperties: false,
						properties: {
							mode: {
								type: "string",
								enum: [
									"off",
									"serve",
									"funnel"
								]
							},
							path: { type: "string" }
						}
					},
					tunnel: {
						type: "object",
						additionalProperties: false,
						properties: {
							provider: {
								type: "string",
								enum: [
									"none",
									"ngrok",
									"tailscale-serve",
									"tailscale-funnel"
								]
							},
							ngrokAuthToken: { type: "string" },
							ngrokDomain: { type: "string" },
							allowNgrokFreeTierLoopbackBypass: { type: "boolean" }
						}
					},
					webhookSecurity: {
						type: "object",
						additionalProperties: false,
						properties: {
							allowedHosts: {
								type: "array",
								items: { type: "string" }
							},
							trustForwardingHeaders: { type: "boolean" },
							trustedProxyIPs: {
								type: "array",
								items: { type: "string" }
							}
						}
					},
					streaming: {
						type: "object",
						additionalProperties: false,
						properties: {
							enabled: { type: "boolean" },
							sttProvider: {
								type: "string",
								enum: ["openai-realtime"]
							},
							openaiApiKey: { type: "string" },
							sttModel: { type: "string" },
							silenceDurationMs: {
								type: "integer",
								minimum: 1
							},
							vadThreshold: {
								type: "number",
								minimum: 0,
								maximum: 1
							},
							streamPath: { type: "string" },
							preStartTimeoutMs: {
								type: "integer",
								minimum: 1
							},
							maxPendingConnections: {
								type: "integer",
								minimum: 1
							},
							maxPendingConnectionsPerIp: {
								type: "integer",
								minimum: 1
							},
							maxConnections: {
								type: "integer",
								minimum: 1
							}
						}
					},
					publicUrl: { type: "string" },
					skipSignatureVerification: { type: "boolean" },
					stt: {
						type: "object",
						additionalProperties: false,
						properties: {
							provider: {
								type: "string",
								enum: ["openai"]
							},
							model: { type: "string" }
						}
					},
					tts: {
						type: "object",
						additionalProperties: false,
						properties: {
							auto: {
								type: "string",
								enum: [
									"off",
									"always",
									"inbound",
									"tagged"
								]
							},
							enabled: { type: "boolean" },
							mode: {
								type: "string",
								enum: ["final", "all"]
							},
							provider: { type: "string" },
							summaryModel: { type: "string" },
							modelOverrides: {
								type: "object",
								additionalProperties: false,
								properties: {
									enabled: { type: "boolean" },
									allowText: { type: "boolean" },
									allowProvider: { type: "boolean" },
									allowVoice: { type: "boolean" },
									allowModelId: { type: "boolean" },
									allowVoiceSettings: { type: "boolean" },
									allowNormalization: { type: "boolean" },
									allowSeed: { type: "boolean" }
								}
							},
							elevenlabs: {
								type: "object",
								additionalProperties: false,
								properties: {
									apiKey: { type: "string" },
									baseUrl: { type: "string" },
									voiceId: { type: "string" },
									modelId: { type: "string" },
									seed: {
										type: "integer",
										minimum: 0,
										maximum: 4294967295
									},
									applyTextNormalization: {
										type: "string",
										enum: [
											"auto",
											"on",
											"off"
										]
									},
									languageCode: { type: "string" },
									voiceSettings: {
										type: "object",
										additionalProperties: false,
										properties: {
											stability: {
												type: "number",
												minimum: 0,
												maximum: 1
											},
											similarityBoost: {
												type: "number",
												minimum: 0,
												maximum: 1
											},
											style: {
												type: "number",
												minimum: 0,
												maximum: 1
											},
											useSpeakerBoost: { type: "boolean" },
											speed: {
												type: "number",
												minimum: .5,
												maximum: 2
											}
										}
									}
								}
							},
							openai: {
								type: "object",
								additionalProperties: false,
								properties: {
									apiKey: { type: "string" },
									baseUrl: { type: "string" },
									model: { type: "string" },
									voice: { type: "string" },
									speed: {
										type: "number",
										minimum: .25,
										maximum: 4
									},
									instructions: { type: "string" }
								}
							},
							edge: {
								type: "object",
								additionalProperties: false,
								properties: {
									enabled: { type: "boolean" },
									voice: { type: "string" },
									lang: { type: "string" },
									outputFormat: { type: "string" },
									pitch: { type: "string" },
									rate: { type: "string" },
									volume: { type: "string" },
									saveSubtitles: { type: "boolean" },
									proxy: { type: "string" },
									timeoutMs: {
										type: "integer",
										minimum: 1e3,
										maximum: 12e4
									}
								}
							},
							prefsPath: { type: "string" },
							maxTextLength: {
								type: "integer",
								minimum: 1
							},
							timeoutMs: {
								type: "integer",
								minimum: 1e3,
								maximum: 12e4
							}
						}
					},
					store: { type: "string" },
					responseModel: { type: "string" },
					responseSystemPrompt: { type: "string" },
					responseTimeoutMs: {
						type: "integer",
						minimum: 1
					}
				}
			},
			uiHints: {
				provider: {
					label: "Provider",
					help: "Use twilio, telnyx, or mock for dev/no-network."
				},
				fromNumber: {
					label: "From Number",
					placeholder: "+15550001234"
				},
				toNumber: {
					label: "Default To Number",
					placeholder: "+15550001234"
				},
				inboundPolicy: { label: "Inbound Policy" },
				allowFrom: { label: "Inbound Allowlist" },
				inboundGreeting: {
					label: "Inbound Greeting",
					advanced: true
				},
				"telnyx.apiKey": {
					label: "Telnyx API Key",
					sensitive: true
				},
				"telnyx.connectionId": { label: "Telnyx Connection ID" },
				"telnyx.publicKey": {
					label: "Telnyx Public Key",
					sensitive: true
				},
				"twilio.accountSid": { label: "Twilio Account SID" },
				"twilio.authToken": {
					label: "Twilio Auth Token",
					sensitive: true
				},
				"outbound.defaultMode": { label: "Default Call Mode" },
				"outbound.notifyHangupDelaySec": {
					label: "Notify Hangup Delay (sec)",
					advanced: true
				},
				"serve.port": { label: "Webhook Port" },
				"serve.bind": { label: "Webhook Bind" },
				"serve.path": { label: "Webhook Path" },
				"tailscale.mode": {
					label: "Tailscale Mode",
					advanced: true
				},
				"tailscale.path": {
					label: "Tailscale Path",
					advanced: true
				},
				"tunnel.provider": {
					label: "Tunnel Provider",
					advanced: true
				},
				"tunnel.ngrokAuthToken": {
					label: "ngrok Auth Token",
					sensitive: true,
					advanced: true
				},
				"tunnel.ngrokDomain": {
					label: "ngrok Domain",
					advanced: true
				},
				"tunnel.allowNgrokFreeTierLoopbackBypass": {
					label: "Allow ngrok Free Tier (Loopback Bypass)",
					advanced: true
				},
				"streaming.enabled": {
					label: "Enable Streaming",
					advanced: true
				},
				"streaming.openaiApiKey": {
					label: "OpenAI Realtime API Key",
					sensitive: true,
					advanced: true
				},
				"streaming.sttModel": {
					label: "Realtime STT Model",
					advanced: true
				},
				"streaming.streamPath": {
					label: "Media Stream Path",
					advanced: true
				},
				"tts.provider": {
					label: "TTS Provider Override",
					help: "Deep-merges with messages.tts (Microsoft is ignored for calls).",
					advanced: true
				},
				"tts.openai.model": {
					label: "OpenAI TTS Model",
					advanced: true
				},
				"tts.openai.voice": {
					label: "OpenAI TTS Voice",
					advanced: true
				},
				"tts.openai.apiKey": {
					label: "OpenAI API Key",
					sensitive: true,
					advanced: true
				},
				"tts.elevenlabs.modelId": {
					label: "ElevenLabs Model ID",
					advanced: true
				},
				"tts.elevenlabs.voiceId": {
					label: "ElevenLabs Voice ID",
					advanced: true
				},
				"tts.elevenlabs.apiKey": {
					label: "ElevenLabs API Key",
					sensitive: true,
					advanced: true
				},
				"tts.elevenlabs.baseUrl": {
					label: "ElevenLabs Base URL",
					advanced: true
				},
				publicUrl: {
					label: "Public Webhook URL",
					advanced: true
				},
				skipSignatureVerification: {
					label: "Skip Signature Verification",
					advanced: true
				},
				store: {
					label: "Call Log Store Path",
					advanced: true
				},
				responseModel: {
					label: "Response Model",
					advanced: true
				},
				responseSystemPrompt: {
					label: "Response System Prompt",
					advanced: true
				},
				responseTimeoutMs: {
					label: "Response Timeout (ms)",
					advanced: true
				}
			}
		}
	},
	{
		dirName: "volcengine",
		idHint: "volcengine",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/volcengine-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Volcengine provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "volcengine",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["volcengine", "volcengine-plan"],
			providerAuthEnvVars: { volcengine: ["VOLCANO_ENGINE_API_KEY"] },
			providerAuthChoices: [{
				provider: "volcengine",
				method: "api-key",
				choiceId: "volcengine-api-key",
				choiceLabel: "Volcano Engine API key",
				groupId: "volcengine",
				groupLabel: "Volcano Engine",
				groupHint: "API key",
				optionKey: "volcengineApiKey",
				cliFlag: "--volcengine-api-key",
				cliOption: "--volcengine-api-key <key>",
				cliDescription: "Volcano Engine API key"
			}]
		}
	},
	{
		dirName: "whatsapp",
		idHint: "whatsapp",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/whatsapp",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw WhatsApp channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "whatsapp",
				label: "WhatsApp",
				selectionLabel: "WhatsApp (QR link)",
				detailLabel: "WhatsApp Web",
				docsPath: "/channels/whatsapp",
				docsLabel: "whatsapp",
				blurb: "works with your own number; recommend a separate phone + eSIM.",
				systemImage: "message"
			},
			install: {
				npmSpec: "@openclaw/whatsapp",
				localPath: "extensions/whatsapp",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "whatsapp",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["whatsapp"]
		}
	},
	{
		dirName: "xai",
		idHint: "xai-plugin",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/xai-plugin",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw xAI plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "xai",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: { webSearch: {
					type: "object",
					additionalProperties: false,
					properties: {
						apiKey: { type: ["string", "object"] },
						model: { type: "string" },
						inlineCitations: { type: "boolean" }
					}
				} }
			},
			providers: ["xai"],
			providerAuthEnvVars: { xai: ["XAI_API_KEY"] },
			providerAuthChoices: [{
				provider: "xai",
				method: "api-key",
				choiceId: "xai-api-key",
				choiceLabel: "xAI API key",
				groupId: "xai",
				groupLabel: "xAI (Grok)",
				groupHint: "API key",
				optionKey: "xaiApiKey",
				cliFlag: "--xai-api-key",
				cliOption: "--xai-api-key <key>",
				cliDescription: "xAI API key"
			}],
			uiHints: {
				"webSearch.apiKey": {
					label: "Grok Search API Key",
					help: "xAI API key for Grok web search (fallback: XAI_API_KEY env var).",
					sensitive: true
				},
				"webSearch.model": {
					label: "Grok Search Model",
					help: "Grok model override for web search."
				},
				"webSearch.inlineCitations": {
					label: "Inline Citations",
					help: "Include inline markdown citations in Grok responses."
				}
			}
		}
	},
	{
		dirName: "xiaomi",
		idHint: "xiaomi",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/xiaomi-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Xiaomi provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "xiaomi",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["xiaomi"],
			providerAuthEnvVars: { xiaomi: ["XIAOMI_API_KEY"] },
			providerAuthChoices: [{
				provider: "xiaomi",
				method: "api-key",
				choiceId: "xiaomi-api-key",
				choiceLabel: "Xiaomi API key",
				groupId: "xiaomi",
				groupLabel: "Xiaomi",
				groupHint: "API key",
				optionKey: "xiaomiApiKey",
				cliFlag: "--xiaomi-api-key",
				cliOption: "--xiaomi-api-key <key>",
				cliDescription: "Xiaomi API key"
			}]
		}
	},
	{
		dirName: "zai",
		idHint: "zai",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		packageName: "@openclaw/zai-provider",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Z.AI provider plugin",
		packageManifest: { extensions: ["./index.ts"] },
		manifest: {
			id: "zai",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			providers: ["zai"],
			providerAuthEnvVars: { zai: ["ZAI_API_KEY", "Z_AI_API_KEY"] },
			providerAuthChoices: [
				{
					provider: "zai",
					method: "api-key",
					choiceId: "zai-api-key",
					choiceLabel: "Z.AI API key",
					groupId: "zai",
					groupLabel: "Z.AI",
					groupHint: "GLM Coding Plan / Global / CN",
					optionKey: "zaiApiKey",
					cliFlag: "--zai-api-key",
					cliOption: "--zai-api-key <key>",
					cliDescription: "Z.AI API key"
				},
				{
					provider: "zai",
					method: "coding-global",
					choiceId: "zai-coding-global",
					choiceLabel: "Coding-Plan-Global",
					choiceHint: "GLM Coding Plan Global (api.z.ai)",
					groupId: "zai",
					groupLabel: "Z.AI",
					groupHint: "GLM Coding Plan / Global / CN",
					optionKey: "zaiApiKey",
					cliFlag: "--zai-api-key",
					cliOption: "--zai-api-key <key>",
					cliDescription: "Z.AI API key"
				},
				{
					provider: "zai",
					method: "coding-cn",
					choiceId: "zai-coding-cn",
					choiceLabel: "Coding-Plan-CN",
					choiceHint: "GLM Coding Plan CN (open.bigmodel.cn)",
					groupId: "zai",
					groupLabel: "Z.AI",
					groupHint: "GLM Coding Plan / Global / CN",
					optionKey: "zaiApiKey",
					cliFlag: "--zai-api-key",
					cliOption: "--zai-api-key <key>",
					cliDescription: "Z.AI API key"
				},
				{
					provider: "zai",
					method: "global",
					choiceId: "zai-global",
					choiceLabel: "Global",
					choiceHint: "Z.AI Global (api.z.ai)",
					groupId: "zai",
					groupLabel: "Z.AI",
					groupHint: "GLM Coding Plan / Global / CN",
					optionKey: "zaiApiKey",
					cliFlag: "--zai-api-key",
					cliOption: "--zai-api-key <key>",
					cliDescription: "Z.AI API key"
				},
				{
					provider: "zai",
					method: "cn",
					choiceId: "zai-cn",
					choiceLabel: "CN",
					choiceHint: "Z.AI CN (open.bigmodel.cn)",
					groupId: "zai",
					groupLabel: "Z.AI",
					groupHint: "GLM Coding Plan / Global / CN",
					optionKey: "zaiApiKey",
					cliFlag: "--zai-api-key",
					cliOption: "--zai-api-key <key>",
					cliDescription: "Z.AI API key"
				}
			]
		}
	},
	{
		dirName: "zalo",
		idHint: "zalo",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/zalo",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Zalo channel plugin",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "zalo",
				label: "Zalo",
				selectionLabel: "Zalo (Bot API)",
				docsPath: "/channels/zalo",
				docsLabel: "zalo",
				blurb: "Vietnam-focused messaging platform with Bot API.",
				aliases: ["zl"],
				order: 80,
				quickstartAllowFrom: true
			},
			install: {
				npmSpec: "@openclaw/zalo",
				localPath: "extensions/zalo",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "zalo",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["zalo"]
		}
	},
	{
		dirName: "zalouser",
		idHint: "zalouser",
		source: {
			source: "./index.ts",
			built: "index.js"
		},
		setupSource: {
			source: "./setup-entry.ts",
			built: "setup-entry.js"
		},
		packageName: "@openclaw/zalouser",
		packageVersion: "2026.3.22",
		packageDescription: "OpenClaw Zalo Personal Account plugin via native zca-js integration",
		packageManifest: {
			extensions: ["./index.ts"],
			setupEntry: "./setup-entry.ts",
			channel: {
				id: "zalouser",
				label: "Zalo Personal",
				selectionLabel: "Zalo (Personal Account)",
				docsPath: "/channels/zalouser",
				docsLabel: "zalouser",
				blurb: "Zalo personal account via QR code login.",
				aliases: ["zlu"],
				order: 85,
				quickstartAllowFrom: false
			},
			install: {
				npmSpec: "@openclaw/zalouser",
				localPath: "extensions/zalouser",
				defaultChoice: "npm",
				minHostVersion: ">=2026.3.22"
			}
		},
		manifest: {
			id: "zalouser",
			configSchema: {
				type: "object",
				additionalProperties: false,
				properties: {}
			},
			channels: ["zalouser"]
		}
	}
];
function resolveBundledPluginGeneratedPath(rootDir, entry) {
	if (!entry) return null;
	const candidates = [entry.built, entry.source].filter((candidate) => typeof candidate === "string" && candidate.length > 0).map((candidate) => path.resolve(rootDir, candidate));
	for (const candidate of candidates) if (fs.existsSync(candidate)) return candidate;
	return null;
}
//#endregion
//#region src/plugins/bundled-dir.ts
function isSourceCheckoutRoot(packageRoot) {
	return fs.existsSync(path.join(packageRoot, ".git")) && fs.existsSync(path.join(packageRoot, "src")) && fs.existsSync(path.join(packageRoot, "extensions"));
}
function resolveBundledPluginsDir(env = process.env) {
	const override = env.OPENCLAW_BUNDLED_PLUGINS_DIR?.trim();
	if (override) return resolveUserPath(override, env);
	const preferSourceCheckout = Boolean(env.VITEST);
	try {
		const packageRoots = [resolveOpenClawPackageRootSync({ cwd: process.cwd() }), resolveOpenClawPackageRootSync({ moduleUrl: import.meta.url })].filter((entry, index, all) => Boolean(entry) && all.indexOf(entry) === index);
		for (const packageRoot of packageRoots) {
			const sourceExtensionsDir = path.join(packageRoot, "extensions");
			const builtExtensionsDir = path.join(packageRoot, "dist", "extensions");
			if ((preferSourceCheckout || isSourceCheckoutRoot(packageRoot)) && fs.existsSync(sourceExtensionsDir)) return sourceExtensionsDir;
			const runtimeExtensionsDir = path.join(packageRoot, "dist-runtime", "extensions");
			if (fs.existsSync(runtimeExtensionsDir) && fs.existsSync(builtExtensionsDir)) return runtimeExtensionsDir;
			if (fs.existsSync(builtExtensionsDir)) return builtExtensionsDir;
		}
	} catch {}
	try {
		const execDir = path.dirname(process.execPath);
		const siblingBuilt = path.join(execDir, "dist", "extensions");
		if (fs.existsSync(siblingBuilt)) return siblingBuilt;
		const sibling = path.join(execDir, "extensions");
		if (fs.existsSync(sibling)) return sibling;
	} catch {}
	try {
		let cursor = path.dirname(fileURLToPath(import.meta.url));
		for (let i = 0; i < 6; i += 1) {
			const candidate = path.join(cursor, "extensions");
			if (fs.existsSync(candidate)) return candidate;
			const parent = path.dirname(cursor);
			if (parent === cursor) break;
			cursor = parent;
		}
	} catch {}
}
//#endregion
//#region src/plugins/roots.ts
function resolvePluginSourceRoots(params) {
	const env = params.env ?? process.env;
	const workspaceRoot = params.workspaceDir ? resolveUserPath(params.workspaceDir, env) : void 0;
	return {
		stock: resolveBundledPluginsDir(env),
		global: path.join(resolveConfigDir(env), "extensions"),
		workspace: workspaceRoot ? path.join(workspaceRoot, ".openclaw", "extensions") : void 0
	};
}
function resolvePluginCacheInputs(params) {
	const env = params.env ?? process.env;
	return {
		roots: resolvePluginSourceRoots({
			workspaceDir: params.workspaceDir,
			env
		}),
		loadPaths: (params.loadPaths ?? []).filter((entry) => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean).map((entry) => resolveUserPath(entry, env))
	};
}
//#endregion
//#region src/plugins/discovery.ts
const EXTENSION_EXTS = new Set([
	".ts",
	".js",
	".mts",
	".cts",
	".mjs",
	".cjs"
]);
const CANONICAL_PACKAGE_ID_ALIASES = {
	"elevenlabs-speech": "elevenlabs",
	"microsoft-speech": "microsoft",
	"ollama-provider": "ollama",
	"sglang-provider": "sglang",
	"vllm-provider": "vllm"
};
const discoveryCache = /* @__PURE__ */ new Map();
const DEFAULT_DISCOVERY_CACHE_MS = 1e3;
function clearPluginDiscoveryCache() {
	discoveryCache.clear();
}
function resolveDiscoveryCacheMs(env) {
	const raw = env.OPENCLAW_PLUGIN_DISCOVERY_CACHE_MS?.trim();
	if (raw === "" || raw === "0") return 0;
	if (!raw) return DEFAULT_DISCOVERY_CACHE_MS;
	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed)) return DEFAULT_DISCOVERY_CACHE_MS;
	return Math.max(0, parsed);
}
function shouldUseDiscoveryCache(env) {
	if (env.OPENCLAW_DISABLE_PLUGIN_DISCOVERY_CACHE?.trim()) return false;
	return resolveDiscoveryCacheMs(env) > 0;
}
function buildDiscoveryCacheKey(params) {
	const { roots, loadPaths } = resolvePluginCacheInputs({
		workspaceDir: params.workspaceDir,
		loadPaths: params.extraPaths,
		env: params.env
	});
	const workspaceKey = roots.workspace ?? "";
	const configExtensionsRoot = roots.global ?? "";
	const bundledRoot = roots.stock ?? "";
	return `${workspaceKey}::${params.ownershipUid ?? currentUid() ?? "none"}::${configExtensionsRoot}::${bundledRoot}::${JSON.stringify(loadPaths)}`;
}
function currentUid(overrideUid) {
	if (overrideUid !== void 0) return overrideUid;
	if (process.platform === "win32") return null;
	if (typeof process.getuid !== "function") return null;
	return process.getuid();
}
function checkSourceEscapesRoot(params) {
	const sourceRealPath = safeRealpathSync(params.source);
	const rootRealPath = safeRealpathSync(params.rootDir);
	if (!sourceRealPath || !rootRealPath) return null;
	if (isPathInside(rootRealPath, sourceRealPath)) return null;
	return {
		reason: "source_escapes_root",
		sourcePath: params.source,
		rootPath: params.rootDir,
		targetPath: params.source,
		sourceRealPath,
		rootRealPath
	};
}
function checkPathStatAndPermissions(params) {
	if (process.platform === "win32") return null;
	const pathsToCheck = [params.rootDir, params.source];
	const seen = /* @__PURE__ */ new Set();
	for (const targetPath of pathsToCheck) {
		const normalized = path.resolve(targetPath);
		if (seen.has(normalized)) continue;
		seen.add(normalized);
		let stat = safeStatSync(targetPath);
		if (!stat) return {
			reason: "path_stat_failed",
			sourcePath: params.source,
			rootPath: params.rootDir,
			targetPath
		};
		let modeBits = stat.mode & 511;
		if ((modeBits & 2) !== 0 && params.origin === "bundled") try {
			fs.chmodSync(targetPath, modeBits & -19);
			const repairedStat = safeStatSync(targetPath);
			if (!repairedStat) return {
				reason: "path_stat_failed",
				sourcePath: params.source,
				rootPath: params.rootDir,
				targetPath
			};
			stat = repairedStat;
			modeBits = repairedStat.mode & 511;
		} catch {}
		if ((modeBits & 2) !== 0) return {
			reason: "path_world_writable",
			sourcePath: params.source,
			rootPath: params.rootDir,
			targetPath,
			modeBits
		};
		if (params.origin !== "bundled" && params.uid !== null && typeof stat.uid === "number" && stat.uid !== params.uid && stat.uid !== 0) return {
			reason: "path_suspicious_ownership",
			sourcePath: params.source,
			rootPath: params.rootDir,
			targetPath,
			foundUid: stat.uid,
			expectedUid: params.uid
		};
	}
	return null;
}
function findCandidateBlockIssue(params) {
	const escaped = checkSourceEscapesRoot({
		source: params.source,
		rootDir: params.rootDir
	});
	if (escaped) return escaped;
	return checkPathStatAndPermissions({
		source: params.source,
		rootDir: params.rootDir,
		origin: params.origin,
		uid: currentUid(params.ownershipUid)
	});
}
function formatCandidateBlockMessage(issue) {
	if (issue.reason === "source_escapes_root") return `blocked plugin candidate: source escapes plugin root (${issue.sourcePath} -> ${issue.sourceRealPath}; root=${issue.rootRealPath})`;
	if (issue.reason === "path_stat_failed") return `blocked plugin candidate: cannot stat path (${issue.targetPath})`;
	if (issue.reason === "path_world_writable") return `blocked plugin candidate: world-writable path (${issue.targetPath}, mode=${formatPosixMode(issue.modeBits ?? 0)})`;
	return `blocked plugin candidate: suspicious ownership (${issue.targetPath}, uid=${issue.foundUid}, expected uid=${issue.expectedUid} or root)`;
}
function isUnsafePluginCandidate(params) {
	const issue = findCandidateBlockIssue({
		source: params.source,
		rootDir: params.rootDir,
		origin: params.origin,
		ownershipUid: params.ownershipUid
	});
	if (!issue) return false;
	params.diagnostics.push({
		level: "warn",
		source: issue.targetPath,
		message: formatCandidateBlockMessage(issue)
	});
	return true;
}
function isExtensionFile(filePath) {
	const ext = path.extname(filePath);
	if (!EXTENSION_EXTS.has(ext)) return false;
	return !filePath.endsWith(".d.ts");
}
function shouldIgnoreScannedDirectory(dirName) {
	const normalized = dirName.trim().toLowerCase();
	if (!normalized) return true;
	if (normalized.endsWith(".bak")) return true;
	if (normalized.includes(".backup-")) return true;
	if (normalized.includes(".disabled")) return true;
	return false;
}
function readPackageManifest(dir, rejectHardlinks = true) {
	const opened = openBoundaryFileSync({
		absolutePath: path.join(dir, "package.json"),
		rootPath: dir,
		boundaryLabel: "plugin package directory",
		rejectHardlinks
	});
	if (!opened.ok) return null;
	try {
		const raw = fs.readFileSync(opened.fd, "utf-8");
		return JSON.parse(raw);
	} catch {
		return null;
	} finally {
		fs.closeSync(opened.fd);
	}
}
function deriveIdHint(params) {
	const base = path.basename(params.filePath, path.extname(params.filePath));
	const rawPackageName = params.packageName?.trim();
	if (!rawPackageName) return base;
	const unscoped = rawPackageName.includes("/") ? rawPackageName.split("/").pop() ?? rawPackageName : rawPackageName;
	const canonicalPackageId = CANONICAL_PACKAGE_ID_ALIASES[unscoped] ?? unscoped;
	const normalizedPackageId = canonicalPackageId.endsWith("-provider") && canonicalPackageId.length > 9 ? canonicalPackageId.slice(0, -9) : canonicalPackageId;
	if (!params.hasMultipleExtensions) return normalizedPackageId;
	return `${normalizedPackageId}/${base}`;
}
function addCandidate(params) {
	const resolved = path.resolve(params.source);
	if (params.seen.has(resolved)) return;
	const resolvedRoot = safeRealpathSync(params.rootDir) ?? path.resolve(params.rootDir);
	if (isUnsafePluginCandidate({
		source: resolved,
		rootDir: resolvedRoot,
		origin: params.origin,
		diagnostics: params.diagnostics,
		ownershipUid: params.ownershipUid
	})) return;
	params.seen.add(resolved);
	const manifest = params.manifest ?? null;
	params.candidates.push({
		idHint: params.idHint,
		source: resolved,
		setupSource: params.setupSource,
		rootDir: resolvedRoot,
		origin: params.origin,
		format: params.format ?? "openclaw",
		bundleFormat: params.bundleFormat,
		workspaceDir: params.workspaceDir,
		packageName: manifest?.name?.trim() || void 0,
		packageVersion: manifest?.version?.trim() || void 0,
		packageDescription: manifest?.description?.trim() || void 0,
		packageDir: params.packageDir,
		packageManifest: getPackageManifestMetadata(manifest ?? void 0),
		bundledManifest: params.bundledManifest,
		bundledManifestPath: params.bundledManifestPath
	});
}
function discoverBundleInRoot(params) {
	const bundleFormat = detectBundleManifestFormat(params.rootDir);
	if (!bundleFormat) return "none";
	const bundleManifest = loadBundleManifest({
		rootDir: params.rootDir,
		bundleFormat,
		rejectHardlinks: params.origin !== "bundled"
	});
	if (!bundleManifest.ok) {
		params.diagnostics.push({
			level: "error",
			message: bundleManifest.error,
			source: bundleManifest.manifestPath
		});
		return "invalid";
	}
	addCandidate({
		candidates: params.candidates,
		diagnostics: params.diagnostics,
		seen: params.seen,
		idHint: bundleManifest.manifest.id,
		source: params.rootDir,
		rootDir: params.rootDir,
		origin: params.origin,
		format: "bundle",
		bundleFormat,
		ownershipUid: params.ownershipUid,
		workspaceDir: params.workspaceDir
	});
	return "added";
}
function resolvePackageEntrySource(params) {
	const opened = openBoundaryFileSync({
		absolutePath: path.resolve(params.packageDir, params.entryPath),
		rootPath: params.packageDir,
		boundaryLabel: "plugin package directory",
		rejectHardlinks: params.rejectHardlinks ?? true
	});
	if (!opened.ok) return matchBoundaryFileOpenFailure(opened, {
		path: () => null,
		io: () => {
			params.diagnostics.push({
				level: "warn",
				message: `extension entry unreadable (I/O error): ${params.entryPath}`,
				source: params.sourceLabel
			});
			return null;
		},
		fallback: () => {
			params.diagnostics.push({
				level: "error",
				message: `extension entry escapes package directory: ${params.entryPath}`,
				source: params.sourceLabel
			});
			return null;
		}
	});
	const safeSource = opened.path;
	fs.closeSync(opened.fd);
	return safeSource;
}
function discoverInDirectory(params) {
	if (!fs.existsSync(params.dir)) return;
	let entries = [];
	try {
		entries = fs.readdirSync(params.dir, { withFileTypes: true });
	} catch (err) {
		params.diagnostics.push({
			level: "warn",
			message: `failed to read extensions dir: ${params.dir} (${String(err)})`,
			source: params.dir
		});
		return;
	}
	for (const entry of entries) {
		const fullPath = path.join(params.dir, entry.name);
		if (entry.isFile()) {
			if (!isExtensionFile(fullPath)) continue;
			addCandidate({
				candidates: params.candidates,
				diagnostics: params.diagnostics,
				seen: params.seen,
				idHint: path.basename(entry.name, path.extname(entry.name)),
				source: fullPath,
				rootDir: path.dirname(fullPath),
				origin: params.origin,
				ownershipUid: params.ownershipUid,
				workspaceDir: params.workspaceDir
			});
		}
		if (!entry.isDirectory()) continue;
		if (params.skipDirectories?.has(entry.name)) continue;
		if (shouldIgnoreScannedDirectory(entry.name)) continue;
		const rejectHardlinks = params.origin !== "bundled";
		const manifest = readPackageManifest(fullPath, rejectHardlinks);
		const extensionResolution = resolvePackageExtensionEntries(manifest ?? void 0);
		const extensions = extensionResolution.status === "ok" ? extensionResolution.entries : [];
		const setupEntryPath = getPackageManifestMetadata(manifest ?? void 0)?.setupEntry;
		const setupSource = typeof setupEntryPath === "string" && setupEntryPath.trim().length > 0 ? resolvePackageEntrySource({
			packageDir: fullPath,
			entryPath: setupEntryPath,
			sourceLabel: fullPath,
			diagnostics: params.diagnostics,
			rejectHardlinks
		}) : null;
		if (extensions.length > 0) {
			for (const extPath of extensions) {
				const resolved = resolvePackageEntrySource({
					packageDir: fullPath,
					entryPath: extPath,
					sourceLabel: fullPath,
					diagnostics: params.diagnostics,
					rejectHardlinks
				});
				if (!resolved) continue;
				addCandidate({
					candidates: params.candidates,
					diagnostics: params.diagnostics,
					seen: params.seen,
					idHint: deriveIdHint({
						filePath: resolved,
						packageName: manifest?.name,
						hasMultipleExtensions: extensions.length > 1
					}),
					source: resolved,
					...setupSource ? { setupSource } : {},
					rootDir: fullPath,
					origin: params.origin,
					ownershipUid: params.ownershipUid,
					workspaceDir: params.workspaceDir,
					manifest,
					packageDir: fullPath
				});
			}
			continue;
		}
		if (discoverBundleInRoot({
			rootDir: fullPath,
			origin: params.origin,
			ownershipUid: params.ownershipUid,
			workspaceDir: params.workspaceDir,
			candidates: params.candidates,
			diagnostics: params.diagnostics,
			seen: params.seen
		}) === "added") continue;
		const indexFile = [...DEFAULT_PLUGIN_ENTRY_CANDIDATES].map((candidate) => path.join(fullPath, candidate)).find((candidate) => fs.existsSync(candidate));
		if (indexFile && isExtensionFile(indexFile)) addCandidate({
			candidates: params.candidates,
			diagnostics: params.diagnostics,
			seen: params.seen,
			idHint: entry.name,
			source: indexFile,
			...setupSource ? { setupSource } : {},
			rootDir: fullPath,
			origin: params.origin,
			ownershipUid: params.ownershipUid,
			workspaceDir: params.workspaceDir,
			manifest,
			packageDir: fullPath
		});
	}
}
function discoverFromPath(params) {
	const resolved = resolveUserPath(params.rawPath, params.env);
	if (!fs.existsSync(resolved)) {
		params.diagnostics.push({
			level: "error",
			message: `plugin path not found: ${resolved}`,
			source: resolved
		});
		return;
	}
	const stat = fs.statSync(resolved);
	if (stat.isFile()) {
		if (!isExtensionFile(resolved)) {
			params.diagnostics.push({
				level: "error",
				message: `plugin path is not a supported file: ${resolved}`,
				source: resolved
			});
			return;
		}
		addCandidate({
			candidates: params.candidates,
			diagnostics: params.diagnostics,
			seen: params.seen,
			idHint: path.basename(resolved, path.extname(resolved)),
			source: resolved,
			rootDir: path.dirname(resolved),
			origin: params.origin,
			ownershipUid: params.ownershipUid,
			workspaceDir: params.workspaceDir
		});
		return;
	}
	if (stat.isDirectory()) {
		const rejectHardlinks = params.origin !== "bundled";
		const manifest = readPackageManifest(resolved, rejectHardlinks);
		const extensionResolution = resolvePackageExtensionEntries(manifest ?? void 0);
		const extensions = extensionResolution.status === "ok" ? extensionResolution.entries : [];
		const setupEntryPath = getPackageManifestMetadata(manifest ?? void 0)?.setupEntry;
		const setupSource = typeof setupEntryPath === "string" && setupEntryPath.trim().length > 0 ? resolvePackageEntrySource({
			packageDir: resolved,
			entryPath: setupEntryPath,
			sourceLabel: resolved,
			diagnostics: params.diagnostics,
			rejectHardlinks
		}) : null;
		if (extensions.length > 0) {
			for (const extPath of extensions) {
				const source = resolvePackageEntrySource({
					packageDir: resolved,
					entryPath: extPath,
					sourceLabel: resolved,
					diagnostics: params.diagnostics,
					rejectHardlinks
				});
				if (!source) continue;
				addCandidate({
					candidates: params.candidates,
					diagnostics: params.diagnostics,
					seen: params.seen,
					idHint: deriveIdHint({
						filePath: source,
						packageName: manifest?.name,
						hasMultipleExtensions: extensions.length > 1
					}),
					source,
					...setupSource ? { setupSource } : {},
					rootDir: resolved,
					origin: params.origin,
					ownershipUid: params.ownershipUid,
					workspaceDir: params.workspaceDir,
					manifest,
					packageDir: resolved
				});
			}
			return;
		}
		if (discoverBundleInRoot({
			rootDir: resolved,
			origin: params.origin,
			ownershipUid: params.ownershipUid,
			workspaceDir: params.workspaceDir,
			candidates: params.candidates,
			diagnostics: params.diagnostics,
			seen: params.seen
		}) === "added") return;
		const indexFile = [...DEFAULT_PLUGIN_ENTRY_CANDIDATES].map((candidate) => path.join(resolved, candidate)).find((candidate) => fs.existsSync(candidate));
		if (indexFile && isExtensionFile(indexFile)) {
			addCandidate({
				candidates: params.candidates,
				diagnostics: params.diagnostics,
				seen: params.seen,
				idHint: path.basename(resolved),
				source: indexFile,
				...setupSource ? { setupSource } : {},
				rootDir: resolved,
				origin: params.origin,
				ownershipUid: params.ownershipUid,
				workspaceDir: params.workspaceDir,
				manifest,
				packageDir: resolved
			});
			return;
		}
		discoverInDirectory({
			dir: resolved,
			origin: params.origin,
			ownershipUid: params.ownershipUid,
			workspaceDir: params.workspaceDir,
			candidates: params.candidates,
			diagnostics: params.diagnostics,
			seen: params.seen
		});
		return;
	}
}
function discoverBundledMetadataInDirectory(params) {
	if (!fs.existsSync(params.dir)) return null;
	const coveredDirectories = /* @__PURE__ */ new Set();
	for (const entry of BUNDLED_PLUGIN_METADATA) {
		const rootDir = path.join(params.dir, entry.dirName);
		if (!fs.existsSync(rootDir)) continue;
		coveredDirectories.add(entry.dirName);
		const source = resolveBundledPluginGeneratedPath(rootDir, entry.source);
		if (!source) continue;
		const setupSource = resolveBundledPluginGeneratedPath(rootDir, entry.setupSource);
		const packageManifest = readPackageManifest(rootDir, false);
		addCandidate({
			candidates: params.candidates,
			diagnostics: params.diagnostics,
			seen: params.seen,
			idHint: entry.idHint,
			source,
			...setupSource ? { setupSource } : {},
			rootDir,
			origin: "bundled",
			ownershipUid: params.ownershipUid,
			manifest: {
				...packageManifest,
				...!packageManifest?.name && entry.packageName ? { name: entry.packageName } : {},
				...!packageManifest?.version && entry.packageVersion ? { version: entry.packageVersion } : {},
				...!packageManifest?.description && entry.packageDescription ? { description: entry.packageDescription } : {},
				...!packageManifest?.openclaw && entry.packageManifest ? { openclaw: entry.packageManifest } : {}
			},
			packageDir: rootDir,
			bundledManifest: entry.manifest,
			bundledManifestPath: path.join(rootDir, "openclaw.plugin.json")
		});
	}
	return coveredDirectories;
}
function discoverOpenClawPlugins(params) {
	const env = params.env ?? process.env;
	const cacheEnabled = params.cache !== false && shouldUseDiscoveryCache(env);
	const cacheKey = buildDiscoveryCacheKey({
		workspaceDir: params.workspaceDir,
		extraPaths: params.extraPaths,
		ownershipUid: params.ownershipUid,
		env
	});
	if (cacheEnabled) {
		const cached = discoveryCache.get(cacheKey);
		if (cached && cached.expiresAt > Date.now()) return cached.result;
	}
	const candidates = [];
	const diagnostics = [];
	const seen = /* @__PURE__ */ new Set();
	const workspaceDir = params.workspaceDir?.trim();
	const workspaceRoot = workspaceDir ? resolveUserPath(workspaceDir, env) : void 0;
	const roots = resolvePluginSourceRoots({
		workspaceDir: workspaceRoot,
		env
	});
	const extra = params.extraPaths ?? [];
	for (const extraPath of extra) {
		if (typeof extraPath !== "string") continue;
		const trimmed = extraPath.trim();
		if (!trimmed) continue;
		discoverFromPath({
			rawPath: trimmed,
			origin: "config",
			ownershipUid: params.ownershipUid,
			workspaceDir: workspaceDir?.trim() || void 0,
			env,
			candidates,
			diagnostics,
			seen
		});
	}
	if (roots.workspace && workspaceRoot) discoverInDirectory({
		dir: roots.workspace,
		origin: "workspace",
		ownershipUid: params.ownershipUid,
		workspaceDir: workspaceRoot,
		candidates,
		diagnostics,
		seen
	});
	if (roots.stock) {
		const coveredBundledDirectories = discoverBundledMetadataInDirectory({
			dir: roots.stock,
			ownershipUid: params.ownershipUid,
			candidates,
			diagnostics,
			seen
		});
		discoverInDirectory({
			dir: roots.stock,
			origin: "bundled",
			ownershipUid: params.ownershipUid,
			candidates,
			diagnostics,
			seen,
			...coveredBundledDirectories ? { skipDirectories: coveredBundledDirectories } : {}
		});
	}
	discoverInDirectory({
		dir: roots.global,
		origin: "global",
		ownershipUid: params.ownershipUid,
		candidates,
		diagnostics,
		seen
	});
	const result = {
		candidates,
		diagnostics
	};
	if (cacheEnabled) {
		const ttl = resolveDiscoveryCacheMs(env);
		if (ttl > 0) discoveryCache.set(cacheKey, {
			expiresAt: Date.now() + ttl,
			result
		});
	}
	return result;
}
//#endregion
//#region src/plugins/manifest-registry.ts
const PLUGIN_ORIGIN_RANK = {
	config: 0,
	workspace: 1,
	global: 2,
	bundled: 3
};
const registryCache = /* @__PURE__ */ new Map();
const DEFAULT_MANIFEST_CACHE_MS = 1e3;
function clearPluginManifestRegistryCache() {
	registryCache.clear();
}
function resolveManifestCacheMs(env) {
	const raw = env.OPENCLAW_PLUGIN_MANIFEST_CACHE_MS?.trim();
	if (raw === "" || raw === "0") return 0;
	if (!raw) return DEFAULT_MANIFEST_CACHE_MS;
	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed)) return DEFAULT_MANIFEST_CACHE_MS;
	return Math.max(0, parsed);
}
function shouldUseManifestCache(env) {
	if (env.OPENCLAW_DISABLE_PLUGIN_MANIFEST_CACHE?.trim()) return false;
	return resolveManifestCacheMs(env) > 0;
}
function buildCacheKey(params) {
	const { roots, loadPaths } = resolvePluginCacheInputs({
		workspaceDir: params.workspaceDir,
		loadPaths: params.plugins.loadPaths,
		env: params.env
	});
	return `${roots.workspace ?? ""}::${roots.global}::${roots.stock ?? ""}::${resolveRuntimeServiceVersion(params.env)}::${JSON.stringify(loadPaths)}`;
}
function safeStatMtimeMs(filePath) {
	try {
		return fs.statSync(filePath).mtimeMs;
	} catch {
		return null;
	}
}
function normalizeManifestLabel(raw) {
	const trimmed = raw?.trim();
	return trimmed ? trimmed : void 0;
}
function isCompatiblePluginIdHint(idHint, manifestId) {
	const normalizedHint = idHint?.trim();
	if (!normalizedHint) return true;
	if (normalizedHint === manifestId) return true;
	return normalizedHint === `${manifestId}-provider` || normalizedHint === `${manifestId}-plugin` || normalizedHint === `${manifestId}-sandbox` || normalizedHint === `${manifestId}-media-understanding`;
}
function buildRecord(params) {
	return {
		id: params.manifest.id,
		name: normalizeManifestLabel(params.manifest.name) ?? params.candidate.packageName,
		description: normalizeManifestLabel(params.manifest.description) ?? params.candidate.packageDescription,
		version: normalizeManifestLabel(params.manifest.version) ?? params.candidate.packageVersion,
		enabledByDefault: params.manifest.enabledByDefault === true ? true : void 0,
		format: params.candidate.format ?? "openclaw",
		bundleFormat: params.candidate.bundleFormat,
		kind: params.manifest.kind,
		channels: params.manifest.channels ?? [],
		providers: params.manifest.providers ?? [],
		providerAuthEnvVars: params.manifest.providerAuthEnvVars,
		providerAuthChoices: params.manifest.providerAuthChoices,
		skills: params.manifest.skills ?? [],
		settingsFiles: [],
		hooks: [],
		origin: params.candidate.origin,
		workspaceDir: params.candidate.workspaceDir,
		rootDir: params.candidate.rootDir,
		source: params.candidate.source,
		setupSource: params.candidate.setupSource,
		startupDeferConfiguredChannelFullLoadUntilAfterListen: params.candidate.packageManifest?.startup?.deferConfiguredChannelFullLoadUntilAfterListen === true,
		manifestPath: params.manifestPath,
		schemaCacheKey: params.schemaCacheKey,
		configSchema: params.configSchema,
		configUiHints: params.manifest.uiHints,
		...params.candidate.packageManifest?.channel?.id ? { channelCatalogMeta: {
			id: params.candidate.packageManifest.channel.id,
			...params.candidate.packageManifest.channel.preferOver ? { preferOver: params.candidate.packageManifest.channel.preferOver } : {}
		} } : {}
	};
}
function buildBundleRecord(params) {
	return {
		id: params.manifest.id,
		name: normalizeManifestLabel(params.manifest.name) ?? params.candidate.idHint,
		description: normalizeManifestLabel(params.manifest.description),
		version: normalizeManifestLabel(params.manifest.version),
		format: "bundle",
		bundleFormat: params.candidate.bundleFormat,
		bundleCapabilities: params.manifest.capabilities,
		channels: [],
		providers: [],
		skills: params.manifest.skills ?? [],
		settingsFiles: params.manifest.settingsFiles ?? [],
		hooks: params.manifest.hooks ?? [],
		origin: params.candidate.origin,
		workspaceDir: params.candidate.workspaceDir,
		rootDir: params.candidate.rootDir,
		source: params.candidate.source,
		manifestPath: params.manifestPath,
		schemaCacheKey: void 0,
		configSchema: void 0,
		configUiHints: void 0
	};
}
function matchesInstalledPluginRecord(params) {
	if (params.candidate.origin !== "global") return false;
	const record = params.config?.plugins?.installs?.[params.pluginId];
	if (!record) return false;
	const candidateSource = resolveUserPath(params.candidate.source, params.env);
	const trackedPaths = [record.installPath, record.sourcePath].filter((entry) => typeof entry === "string" && entry.trim().length > 0).map((entry) => resolveUserPath(entry, params.env));
	if (trackedPaths.length === 0) return false;
	return trackedPaths.some((trackedPath) => {
		return candidateSource === trackedPath || isPathInside(trackedPath, candidateSource);
	});
}
function resolveDuplicatePrecedenceRank(params) {
	if (params.candidate.origin === "config") return 0;
	if (params.candidate.origin === "global" && matchesInstalledPluginRecord({
		pluginId: params.pluginId,
		candidate: params.candidate,
		config: params.config,
		env: params.env
	})) return 1;
	if (params.candidate.origin === "bundled") return 2;
	if (params.candidate.origin === "workspace") return 3;
	return 4;
}
function loadPluginManifestRegistry(params = {}) {
	const config = params.config ?? {};
	const normalized = normalizePluginsConfig(config.plugins);
	const env = params.env ?? process.env;
	const cacheKey = buildCacheKey({
		workspaceDir: params.workspaceDir,
		plugins: normalized,
		env
	});
	const cacheEnabled = params.cache !== false && shouldUseManifestCache(env);
	if (cacheEnabled) {
		const cached = registryCache.get(cacheKey);
		if (cached && cached.expiresAt > Date.now()) return cached.registry;
	}
	const discovery = params.candidates ? {
		candidates: params.candidates,
		diagnostics: params.diagnostics ?? []
	} : discoverOpenClawPlugins({
		workspaceDir: params.workspaceDir,
		extraPaths: normalized.loadPaths,
		cache: params.cache,
		env
	});
	const diagnostics = [...discovery.diagnostics];
	const candidates = discovery.candidates;
	const records = [];
	const seenIds = /* @__PURE__ */ new Map();
	const realpathCache = /* @__PURE__ */ new Map();
	const currentHostVersion = resolveRuntimeServiceVersion(env);
	for (const candidate of candidates) {
		const rejectHardlinks = candidate.origin !== "bundled";
		const isBundleRecord = (candidate.format ?? "openclaw") === "bundle";
		const manifestRes = candidate.origin === "bundled" && candidate.bundledManifest && candidate.bundledManifestPath ? {
			ok: true,
			manifest: candidate.bundledManifest,
			manifestPath: candidate.bundledManifestPath
		} : isBundleRecord && candidate.bundleFormat ? loadBundleManifest({
			rootDir: candidate.rootDir,
			bundleFormat: candidate.bundleFormat,
			rejectHardlinks
		}) : loadPluginManifest(candidate.rootDir, rejectHardlinks);
		if (!manifestRes.ok) {
			diagnostics.push({
				level: "error",
				message: manifestRes.error,
				source: manifestRes.manifestPath
			});
			continue;
		}
		const manifest = manifestRes.manifest;
		const minHostVersionCheck = checkMinHostVersion({
			currentVersion: currentHostVersion,
			minHostVersion: candidate.packageManifest?.install?.minHostVersion
		});
		if (!minHostVersionCheck.ok) {
			const packageManifestSource = path.join(candidate.packageDir ?? candidate.rootDir, "package.json");
			diagnostics.push({
				level: minHostVersionCheck.kind === "unknown_host_version" ? "warn" : "error",
				pluginId: manifest.id,
				source: packageManifestSource,
				message: minHostVersionCheck.kind === "invalid" ? `plugin manifest invalid | ${minHostVersionCheck.error}` : minHostVersionCheck.kind === "unknown_host_version" ? `plugin requires OpenClaw >=${minHostVersionCheck.requirement.minimumLabel}, but this host version could not be determined; skipping load` : `plugin requires OpenClaw >=${minHostVersionCheck.requirement.minimumLabel}, but this host is ${minHostVersionCheck.currentVersion}; skipping load`
			});
			continue;
		}
		if (!isCompatiblePluginIdHint(candidate.idHint, manifest.id)) diagnostics.push({
			level: "warn",
			pluginId: manifest.id,
			source: candidate.source,
			message: `plugin id mismatch (manifest uses "${manifest.id}", entry hints "${candidate.idHint}")`
		});
		const configSchema = "configSchema" in manifest ? manifest.configSchema : void 0;
		const schemaCacheKey = (() => {
			if (!configSchema) return;
			const manifestMtime = safeStatMtimeMs(manifestRes.manifestPath);
			return manifestMtime ? `${manifestRes.manifestPath}:${manifestMtime}` : manifestRes.manifestPath;
		})();
		const existing = seenIds.get(manifest.id);
		if (existing) {
			const samePath = existing.candidate.rootDir === candidate.rootDir;
			if ((() => {
				if (samePath) return true;
				const existingReal = safeRealpathSync(existing.candidate.rootDir, realpathCache);
				const candidateReal = safeRealpathSync(candidate.rootDir, realpathCache);
				return Boolean(existingReal && candidateReal && existingReal === candidateReal);
			})()) {
				if (PLUGIN_ORIGIN_RANK[candidate.origin] < PLUGIN_ORIGIN_RANK[existing.candidate.origin]) {
					records[existing.recordIndex] = isBundleRecord ? buildBundleRecord({
						manifest,
						candidate,
						manifestPath: manifestRes.manifestPath
					}) : buildRecord({
						manifest,
						candidate,
						manifestPath: manifestRes.manifestPath,
						schemaCacheKey,
						configSchema
					});
					seenIds.set(manifest.id, {
						candidate,
						recordIndex: existing.recordIndex
					});
				}
				continue;
			}
			diagnostics.push({
				level: "warn",
				pluginId: manifest.id,
				source: candidate.source,
				message: resolveDuplicatePrecedenceRank({
					pluginId: manifest.id,
					candidate,
					config,
					env
				}) < resolveDuplicatePrecedenceRank({
					pluginId: manifest.id,
					candidate: existing.candidate,
					config,
					env
				}) ? `duplicate plugin id detected; ${existing.candidate.origin} plugin will be overridden by ${candidate.origin} plugin (${candidate.source})` : `duplicate plugin id detected; ${candidate.origin} plugin will be overridden by ${existing.candidate.origin} plugin (${candidate.source})`
			});
		} else seenIds.set(manifest.id, {
			candidate,
			recordIndex: records.length
		});
		records.push(isBundleRecord ? buildBundleRecord({
			manifest,
			candidate,
			manifestPath: manifestRes.manifestPath
		}) : buildRecord({
			manifest,
			candidate,
			manifestPath: manifestRes.manifestPath,
			schemaCacheKey,
			configSchema
		}));
	}
	const registry = {
		plugins: records,
		diagnostics
	};
	if (cacheEnabled) {
		const ttl = resolveManifestCacheMs(env);
		if (ttl > 0) registryCache.set(cacheKey, {
			expiresAt: Date.now() + ttl,
			registry
		});
	}
	return registry;
}
//#endregion
export { resolvePluginCacheInputs as a, discoverOpenClawPlugins as i, loadPluginManifestRegistry as n, resolvePluginSourceRoots as o, clearPluginDiscoveryCache as r, resolveBundledPluginsDir as s, clearPluginManifestRegistryCache as t };
