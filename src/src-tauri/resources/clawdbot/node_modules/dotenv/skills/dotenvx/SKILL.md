---
name: dotenvx
description: Encrypt .env files, use multiple environments, expand variables, and run any command with environment variables injected using dotenvx. Use when the task involves secret encryption, .env.production or .env.staging setups, variable expansion like ${DATABASE_URL}, running CLI commands with env vars, CI/CD secret management, or migrating beyond basic dotenv. Triggers on requests involving dotenvx, encrypted .env files, multiple environment configs, agentic secret storage, or AS2.
---

# dotenvx

*a secure dotenv* — from the creator of [`dotenv`](https://github.com/motdotla/dotenv).

* run anywhere (cross-platform)
* multi-environment
* encrypted envs

[Read the whitepaper](https://dotenvx.com/dotenvx.pdf?v=README)

## Quickstart

Install and use it in code just like `dotenv`.

```sh
npm install @dotenvx/dotenvx --save
```
```js
// index.js
require('@dotenvx/dotenvx').config()
// or import '@dotenvx/dotenvx/config' // for esm

console.log(`Hello ${process.env.HELLO}`)
```

or install globally — *unlocks dotenv for any language, framework, or platform!*

```sh
# curl
curl -sfS https://dotenvx.sh | sh

# brew
brew install dotenvx/brew/dotenvx

# docker
docker run -it --rm -v $(pwd):/app dotenv/dotenvx help

# windows
winget install dotenvx
```

## Run Anywhere

```sh
$ echo "HELLO=World" > .env
$ echo "console.log('Hello ' + process.env.HELLO)" > index.js

$ node index.js
Hello undefined # without dotenvx

$ dotenvx run -- node index.js
Hello World # with dotenvx
```

Works with TypeScript, Deno, Bun, Python, PHP, Ruby, Go, Rust, Java, .NET, Bash, and more. See [extended quickstart guide](https://dotenvx.com/docs/quickstart).

Framework shortcuts:

```sh
$ dotenvx run -- next dev
$ dotenvx run -- npm start
$ dotenvx run -- bin/rails s
$ dotenvx run -- php artisan serve
```

## Multiple Environments

Create a `.env.production` file and use `-f` to load it:

```sh
$ echo "HELLO=production" > .env.production
$ echo "console.log('Hello ' + process.env.HELLO)" > index.js

$ dotenvx run -f .env.production -- node index.js
[dotenvx@1.X.X] injecting env (1) from .env.production
Hello production
```

Load multiple files (first value wins):

```sh
$ echo "HELLO=local" > .env.local
$ echo "HELLO=World" > .env

$ dotenvx run -f .env.local -f .env -- node index.js
[dotenvx@1.X.X] injecting env (1) from .env.local,.env
Hello local
```

Use `--overload` to make subsequent files win instead:

```sh
$ dotenvx run -f .env.local -f .env --overload -- node index.js
Hello World
```

### Convention-based loading

```sh
# Next.js convention
$ dotenvx run --convention=nextjs -- node index.js

# dotenv-flow convention
$ dotenvx run --convention=flow -- node index.js
```

## Encryption

Add encryption to your `.env` files with a single command:

```sh
$ dotenvx encrypt
✔ encrypted (.env)
```

A `DOTENV_PUBLIC_KEY` (encryption key) and a `DOTENV_PRIVATE_KEY` (decryption key) are generated using the same public-key cryptography as Bitcoin (secp256k1).

Encrypt a specific environment file:

```sh
$ dotenvx encrypt -f .env.production
```

Decrypt at runtime by setting the private key (found in `.env.keys`):

```sh
$ DOTENV_PRIVATE_KEY="<key from .env.keys>" dotenvx run -- node index.js
[dotenvx@1.X.X] injecting env (2) from .env
Hello World
```

Per-environment private keys follow the pattern `DOTENV_PRIVATE_KEY_<ENVIRONMENT>`:

```sh
$ DOTENV_PRIVATE_KEY_PRODUCTION="<key>" dotenvx run -- node index.js
# loads .env.production

$ DOTENV_PRIVATE_KEY_CI="<key>" dotenvx run -- node index.js
# loads .env.ci
```

Combine multiple encrypted files:

```sh
$ DOTENV_PRIVATE_KEY="<key>" DOTENV_PRIVATE_KEY_PRODUCTION="<key>" dotenvx run -- node index.js
[dotenvx@1.X.X] injecting env (3) from .env, .env.production
```

**Commit the encrypted `.env` file. Never commit `.env.keys`.**

```sh
# .gitignore
.env.keys
```

## CI/CD

```yaml
# GitHub Actions
- name: Run app
  env:
    DOTENV_PRIVATE_KEY_PRODUCTION: ${{ secrets.DOTENV_PRIVATE_KEY_PRODUCTION }}
  run: dotenvx run -f .env.production -- node index.js
```

Install in CI:

```sh
curl -fsS https://dotenvx.sh/install.sh | sh
```

## Advanced

### Variable Expansion

Reference and expand variables already on your machine:

```ini
# .env
USERNAME="username"
DATABASE_URL="postgres://${USERNAME}@localhost/my_database"
```

```sh
$ dotenvx run -- node index.js
DATABASE_URL postgres://username@localhost/my_database
```

### Default Values

```ini
# .env
DATABASE_HOST=${DB_HOST:-localhost}
DATABASE_PORT=${DB_PORT:-5432}
```

### Alternate Values

```ini
# .env
NODE_ENV=production
DEBUG_MODE=${NODE_ENV:+false}
```

### Interpolation Syntax Summary

```ini
# Default value - use variable if set/non-empty, otherwise use default
TEST=${DEFINED_VAR:-fallback}     # "hello" (if DEFINED_VAR=hello)
TEST=${UNDEFINED_VAR:-fallback}   # "fallback"

# Default value (no colon) - use variable if set, otherwise use default
TEST=${EMPTY_VAR-fallback}        # "" (empty, but set)
TEST=${UNDEFINED_VAR-fallback}    # "fallback"

# Alternate value - use alternate if variable is set/non-empty, otherwise empty
TEST=${DEFINED_VAR:+alternate}    # "alternate"
TEST=${EMPTY_VAR:+alternate}      # "" (empty)

# Alternate value (no colon) - use alternate if variable is set, otherwise empty
TEST=${EMPTY_VAR+alternate}       # "alternate" (empty but set counts)
```

### Command Substitution

```ini
# .env
DATABASE_URL="postgres://$(whoami)@localhost/my_database"
```

### `get` — Read a value

```sh
$ echo "HELLO=World" > .env

$ dotenvx get HELLO
World

$ dotenvx get HELLO -f .env.production
production

$ dotenvx get        # all key/value pairs as JSON
{"HELLO":"World"}
```

### `set` — Write a value (auto-encrypts if file is encrypted)

```sh
$ dotenvx set HELLO World
$ dotenvx set HELLO Production -f .env.production
```

### Pre-commit hook — Prevent committing plaintext secrets

```sh
npm i -g @dotenvx/dotenvx
dotenvx precommit --install
```

### `--strict` — Fail on errors

```sh
$ dotenvx run -f .env.missing --strict -- node index.js
[MISSING_ENV_FILE] missing .env.missing file
```

### Quiet / Debug / Log levels

```sh
$ dotenvx run -f .env.production --quiet -- node index.js   # suppress output
$ dotenvx run -f .env.production --debug -- node index.js   # verbose debug
$ dotenvx run -f .env.production --log-level=error -- node index.js
```

## Agentic Secret Storage (AS2)

> Agents run code without humans at terminals, so plaintext `.env` files are the wrong primitive. AS2 is built for autonomous software: encrypted by default, zero console access, and cryptography‑first delivery.

Install vestauth and initialize your agent:

```bash
npm i -g vestauth
vestauth agent init
```

Set secrets:

```bash
vestauth agent curl -X POST https://as2.dotenvx.com/set -d '{"KEY":"value"}'
```

Get secrets:

```bash
vestauth agent curl "https://as2.dotenvx.com/get?key=KEY"
```

See [dotenvx.com/as2](https://dotenvx.com/as2) for the full specification.

## Comparison: dotenv vs dotenvx

| Feature | dotenv | dotenvx |
|---------|--------|---------|
| Load `.env` | ✅ | ✅ |
| Variable expansion | ❌ | ✅ |
| Command substitution | ❌ | ✅ |
| Encryption | ❌ | ✅ |
| Multiple environments | basic | ✅ |
| Works with any language | ❌ | ✅ |
| Agentic secret storage | ❌ | ✅ |

For basic `.env` loading in Node.js, see the [dotenv skill](../dotenv/SKILL.md).

## FAQ

**Should I commit my `.env` file?**

No — unless you encrypt it with `dotenvx encrypt`. Then yes, commit the encrypted `.env` and keep `.env.keys` out of source control.

**How do I use dotenvx in Docker?**

```sh
FROM node:latest
RUN curl -fsS https://dotenvx.sh/install.sh | sh
CMD ["dotenvx", "run", "--", "node", "index.js"]
```

**How do I handle environment variable precedence in containers?**

By default, existing environment variables take precedence over `.env` files (historic dotenv principle). Use `--overload` to make `.env` files win instead.

```sh
# Env var from cloud provider wins (default)
$ MODEL_REGISTRY=registry.azure.com/v2 dotenvx run -f .env.prod -- node app.js

# .env.prod wins (with --overload)
$ MODEL_REGISTRY=registry.azure.com/v2 dotenvx run -f .env.prod --overload -- node app.js
```
