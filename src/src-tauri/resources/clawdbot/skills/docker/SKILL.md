---
name: Docker
description: Build, run, and manage Docker containers and images.
metadata: {"clawdbot":{"emoji":"🐳","homepage":"https://docs.docker.com","requires":{"bins":["docker"]},"install":[{"id":"brew","kind":"brew","formula":"docker","bins":["docker"],"os":["darwin"]},{"id":"download","kind":"download","label":"Install Docker Desktop","url":"https://desktop.docker.com/linux/main/amd64/docker-desktop-amd64.deb","os":["linux"]}]}}
---

# Docker

Manage Docker containers, images, volumes, and networks.

## When to activate

- User asks to build, run, or manage containers
- User wants to create or edit a Dockerfile
- User needs to manage Docker Compose services
- User asks about container logs, status, or resource usage

## Common operations

| Task | Command |
|------|---------|
| List running containers | `docker ps` |
| Build an image | `docker build -t name .` |
| Run a container | `docker run -d -p 8080:80 image` |
| View logs | `docker logs container_id` |
| Compose up | `docker compose up -d` |
| Prune unused resources | `docker system prune` |
