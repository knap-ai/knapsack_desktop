---
name: Terraform
description: Provision and manage infrastructure as code with Terraform.
metadata: {"clawdbot":{"emoji":"🏗️","homepage":"https://www.terraform.io","requires":{"bins":["terraform"]},"install":[{"id":"brew","kind":"brew","formula":"terraform","bins":["terraform"]}]}}
---

# Terraform

Use Terraform to define, plan, and apply infrastructure as code.

## When to activate

- User asks to create or modify Terraform configurations
- User wants to plan or apply infrastructure changes
- User needs to manage Terraform state or workspaces

## Common operations

| Task | Command |
|------|---------|
| Initialize | `terraform init` |
| Plan changes | `terraform plan` |
| Apply changes | `terraform apply` |
| Show state | `terraform show` |
| Destroy resources | `terraform destroy` |
