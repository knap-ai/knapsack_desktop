# Snowflake MCP — resumo das mudanças (branch `test-snowflake`)

Commits acima do `main`: `0da549eea`, `d834f2564`, `d342ae111`.

## O que mudou

### 1. `src-tauri/src/clawd/service.rs`
- Nova função `ensure_knapsack_snowflake_tool_allow()`, chamada em `prepare_gateway_config()` e `set_service_enabled()`.
- Motivo: o gateway trata `tools.allow` como allowlist estrita. Tools de MCP em bundle não usam o nome puro (`snowflake_query`) — o gateway monta `<safeServerName>__<toolName>`. Então o nome certo pra allowlist é `snowflake__snowflake_query`, não `snowflake_query`.
- A função:
  - remove o nome antigo/errado (`snowflake_query`) de `tools.allow` e de `tools.sandbox.tools.allow`, se estiver lá;
  - garante que `snowflake__snowflake_query` esteja em ambas as listas.
- Sem isso, o gateway loga `tools.allow allowlist contains unknown entries` e ignora a tool.

### 2. `src-tauri/src/clawd/snowflake_mcp.rs`
- URL do broker trocada:
  - antes: `https://scout-token-broker-ye3kc3evha-uk.a.run.app`
  - agora: `https://scout-oauth-web-ye3kc3evha-uk.a.run.app`

## 🔴 Erro / bug ativo agora

**`fetch_broker_token_at()` (linha ~106) ignora o e-mail real e usa um e-mail fixo hardcoded:**

```rust
let url = format!("{base_url}/token/{}", "rogelio@bankaya.com.mx");
```

em vez de:

```rust
let url = format!("{base_url}/token/{}", urlencoding::encode(email));
```

**Impacto:** isso quebra completamente o isolamento por usuário que é a premissa de segurança de todo o design descrito no topo do arquivo ("email é resolvido pelo Knapsack, nunca confiado do LLM/modelo"). Com esse hardcode, **qualquer sessão, de qualquer usuário do Slack, vai buscar o token OAuth do Snowflake em nome de `rogelio@bankaya.com.mx`** — não do usuário autenticado da sessão. O parâmetro `email` que vem de `lookup_authorized_session()` passa a ser usado só para o JWT (`sub` claim), mas a URL de fato chamada no broker ignora isso.

- Provavelmente ficou de um teste manual (o comentário na linha 32 do arquivo, `//https://scout-oauth-web-.../token/rogelio@bankaya.com.mx`, é claramente um leftover de debug/teste que não devia ter sido commitado).
- Os testes existentes não pegam isso porque o teste principal (`broker_request_sends_capability_header_and_hits_email_path`) passa justamente `"rogelio@bankaya.com.mx"` como email — então o hardcode "acerta" por coincidência e o teste passa mesmo estando errado. O teste `broker_forbidden_status_is_a_clear_error` usa outro e-mail mas não valida a URL, então também não pega.

### Correção recomendada
```rust
let url = format!("{base_url}/token/{}", urlencoding::encode(email));
```
E também limpar o comentário-lixo da linha 32 do arquivo.

## De onde vem o e-mail (o que deveria ir pro broker)

O e-mail **não** vem do texto da mensagem do Slack nem é fornecido pelo modelo/LLM — é resolvido de forma independente pelo Knapsack:

1. `session_watcher.rs` (`poll_once`) faz polling na gateway via RPC `sessions.list` e pega o `slack_user_id` de quem enviou a mensagem (de `origin.nativeDirectUserId`/`from`).
2. Chama `resolve_slack_email(account_id, slack_user_id)` (`session_watcher.rs:99-137`) → bate na **Slack Web API `users.info`** (`https://slack.com/api/users.info`), autenticado com o bot token lido de `/channels/slack/botToken` na config da gateway, e extrai o e-mail de `/user/profile/email` na resposta.
3. O e-mail resolvido é gravado em disco via `write_identity(&session_id, &email, scope_key)`, em `<clawdbot_home>/snowflake-identities/<session_id>.json` (`IdentityRecord { email, scope_key }`).
4. `lookup_authorized_session(session_id)` (`session_watcher.rs:82-89`) só lê esse arquivo de volta e devolve `(email, scope_key)` — é isso que chega em `handle_snowflake_query` (`snowflake_mcp.rs:231`) como a variável `email`.

Ou seja: o `email` correto **já chega certinho** até `fetch_broker_token(&email, &jwt)`. O bug descrito acima é que, dentro de `fetch_broker_token_at`, esse `email` é usado só no JWT — na hora de montar a URL do broker ele é jogado fora e substituído pelo literal hardcoded `"rogelio@bankaya.com.mx"`.

## 🔴 Erro visto nos logs reais (hoje)

**Log:** `~/Library/Logs/Knapsack/knapsack-clawdbot.err.log`

**Erro recorrente** (última ocorrência hoje, 2026-08-10T14:34:37):
```
[tools] tools.allow allowlist contains unknown entries
(snowflake__snowflake_query).
These entries won't match any tool unless the plugin is enabled.
```
Já tinha aparecido antes em 2026-08-07 (17:56 e 18:26), inclusive com o nome antigo `snowflake_query` (esse já corrigido nos commits `d834f2564`/`d342ae111`).

**O que foi encontrado no config real** (`~/Library/Application Support/ai.knap.knapsack/clawdbot/openclaw.json`):
- `mcp.servers.snowflake` está registrado corretamente (aponta pro binário certo com `--internal-mcp-snowflake`).
- Mas `tools.allow` e `tools.sandbox.tools.allow` **não contêm** `snowflake__snowflake_query` — apesar do código (`ensure_knapsack_snowflake_tool_allow` em `service.rs:1302`) supostamente garantir isso a cada patch de config.

**Ou seja:** a tool MCP do Snowflake está registrada no gateway, mas nunca fica no allowlist efetivo — por isso qualquer chamada a `snowflake_query` falha/é ignorada.

**Suspeita adicional:** o processo do Knapsack (`ps`) está de pé desde sexta-feira — pode estar com a config em memória desatualizada mesmo que o arquivo em disco seja corrigido depois (i.e. `ensure_knapsack_snowflake_tool_allow` roda e grava certo no disco, mas o processo do gateway já em execução não recarrega/repatcheia essa config em runtime). Vale confirmar reiniciando o gateway/app depois do patch e checando se o allowlist efetivo (em memória) reflete o disco.

## Outros pontos já sinalizados no próprio código (não são bugs novos, são "ASSUMPTION FLAGGED" antigos)
- `SNOWFLAKE_ACCOUNT = "bankaya"` é placeholder, ainda não confirmado contra a conta real do Snowflake.
- Formato da resposta do broker (`{"token": "..."}`) também não confirmado contra o broker real.

## Não consegui validar
- `cargo`/`rustc` não estão no PATH deste shell (`source ~/.cargo/env` não resolveu), então não rodei `cargo check`/`cargo test` de fato — a análise acima é por leitura de código. Recomendo rodar localmente:
  ```sh
  cd src && cargo test --manifest-path src-tauri/Cargo.toml clawd
  ```
