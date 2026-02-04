# Contributing to Knapsack

Thank you for considering a contribution to Knapsack. This document explains how to get involved.

## Getting Started

1. Fork the repository and clone your fork
2. Follow the setup instructions in [README.md](README.md)
3. Create a feature branch from `main`

## Development Workflow

```bash
cd src

# Install dependencies
npm install

# Run the app in development mode
npm run tauri -- dev
```

The Vite dev server starts on `http://localhost:1420` with hot reload. The Rust backend runs on port `8897`.

## Making Changes

- Keep pull requests focused on a single change
- Follow existing code style and conventions
- Add or update tests where applicable
- Make sure the project builds cleanly (`npm run build` in `src/`)

## Pull Requests

1. Push your branch to your fork
2. Open a pull request against `main`
3. Describe what the change does and why
4. Link any related issues

## Reporting Bugs

Open an issue with:

- Steps to reproduce
- Expected vs actual behavior
- OS and Knapsack version
- Relevant logs or screenshots

## Security Issues

If you find a security vulnerability, **do not open a public issue**. Email security@knapsack.ai instead.

## Code of Conduct

All participants are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the [AGPL-3.0](LICENSE).
