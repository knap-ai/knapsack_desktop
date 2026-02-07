---
name: OpenAI API
description: Generate text, images, embeddings, and audio with OpenAI models.
metadata: {"clawdbot":{"emoji":"🤖","homepage":"https://platform.openai.com","primaryEnv":"OPENAI_API_KEY","requires":{"env":["OPENAI_API_KEY"]}}}
---

# OpenAI API

Call OpenAI APIs for text generation, image creation, embeddings, and speech.

## When to activate

- User asks to generate images with DALL-E
- User wants to create embeddings for semantic search
- User needs text-to-speech or speech-to-text
- User asks to use GPT models for a specific task

## Setup

Requires an `OPENAI_API_KEY` environment variable.

## Capabilities

- Generate images with DALL-E 3
- Create text embeddings for search and clustering
- Text-to-speech and speech-to-text (Whisper)
- Moderate content with the moderation endpoint
