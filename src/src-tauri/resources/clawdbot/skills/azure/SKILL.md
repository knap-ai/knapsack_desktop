---
name: Azure
description: Manage Microsoft Azure cloud resources and services.
metadata: {"clawdbot":{"emoji":"🔵","homepage":"https://learn.microsoft.com/cli/azure/","requires":{"bins":["az"]},"install":[{"id":"brew","kind":"brew","formula":"azure-cli","bins":["az"]}]}}
---

# Azure

Use the Azure CLI to manage cloud resources and services.

## When to activate

- User asks to manage Azure VMs, storage, or networking
- User wants to deploy to Azure App Service or Functions
- User needs to manage Azure SQL, Cosmos DB, or Key Vault
- User asks about Azure AD, subscriptions, or resource groups

## Common operations

| Task | Command |
|------|---------|
| Login | `az login` |
| List resource groups | `az group list` |
| Create VM | `az vm create --name myVM --image Ubuntu2204` |
| List web apps | `az webapp list` |
| Deploy function | `az functionapp deployment source config-zip` |
| Set subscription | `az account set --subscription NAME` |
