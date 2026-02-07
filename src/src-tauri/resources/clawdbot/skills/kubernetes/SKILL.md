---
name: Kubernetes
description: Deploy and manage Kubernetes clusters, pods, and services.
metadata: {"clawdbot":{"emoji":"☸️","homepage":"https://kubernetes.io/docs/reference/kubectl/","requires":{"bins":["kubectl"]},"install":[{"id":"brew","kind":"brew","formula":"kubernetes-cli","bins":["kubectl"]}]}}
---

# Kubernetes

Use `kubectl` to manage Kubernetes clusters, deployments, pods, and services.

## When to activate

- User asks to deploy, scale, or manage Kubernetes workloads
- User wants to inspect pod logs, status, or events
- User needs to apply or edit Kubernetes manifests

## Common operations

| Task | Command |
|------|---------|
| List pods | `kubectl get pods` |
| View logs | `kubectl logs pod-name` |
| Apply manifest | `kubectl apply -f manifest.yaml` |
| Scale deployment | `kubectl scale deployment/app --replicas=3` |
| Get services | `kubectl get svc` |
| Describe resource | `kubectl describe pod pod-name` |
