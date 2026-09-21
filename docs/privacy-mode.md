# Privacy Mode

Privacy Mode is an enforced desktop policy, not an agent instruction. When it
is on, Knapsack selects only a local Ollama endpoint (`localhost`, `127.0.0.1`,
or `::1`) for inference and rejects every cloud provider, including Cloud
Ollama. It also disables Amplitude and Sentry in the renderer and blocks native
Sentry initialization on the next launch.

Cloud Zero Data Retention cannot be proven from an API key. For that reason this
release fails closed: a ZDR provider is **not** accepted unless a future,
audited deployment attestation explicitly supports it. Normal Mode is unchanged.

The policy is stored in a private, owner-only file at
`~/.knapsack/privacy-mode.json` and can be changed only through the desktop
Settings UI's Tauri IPC command. The local agent/gateway does not have a route
to turn it off. Its provider selection endpoints are independently checked. A
missing policy uses Normal Mode; a malformed, unreadable, or unlocatable policy
fails closed to local-only inference.

The machine-readable [data egress manifest](../src/src-tauri/data-egress-manifest.json)
is versioned with the app and its SHA-256 is visible through the Privacy Mode
status command. It records telemetry, inference, and OAuth destinations.

OAuth remains user initiated. Google uses direct OAuth when desktop credentials
are configured; Privacy Mode rejects its fallback token-exchange service.
Privacy deployments should provision direct or self-hosted OAuth credentials
rather than rely on a Knapsack token-exchange service. Microsoft remains
user-initiated but has no direct desktop token-exchange path in this release.
