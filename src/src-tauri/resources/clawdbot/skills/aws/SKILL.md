---
name: AWS
description: Manage AWS cloud resources — S3, EC2, Lambda, and more.
metadata: {"clawdbot":{"emoji":"☁️","homepage":"https://aws.amazon.com/cli/","requires":{"bins":["aws"]},"install":[{"id":"brew","kind":"brew","formula":"awscli","bins":["aws"]}]}}
---

# AWS

Use the AWS CLI to manage cloud infrastructure and services.

## When to activate

- User asks to manage S3 buckets, EC2 instances, Lambda functions, or other AWS services
- User wants to deploy or configure cloud resources
- User needs to check AWS resource status or costs

## Common operations

| Task | Command |
|------|---------|
| List S3 buckets | `aws s3 ls` |
| Upload to S3 | `aws s3 cp file.txt s3://bucket/` |
| List EC2 instances | `aws ec2 describe-instances` |
| Invoke Lambda | `aws lambda invoke --function-name fn out.json` |
| Check identity | `aws sts get-caller-identity` |
