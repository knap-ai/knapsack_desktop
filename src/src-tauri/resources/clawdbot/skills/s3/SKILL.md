---
name: S3
description: Manage files and buckets in Amazon S3 or S3-compatible storage.
metadata: {"clawdbot":{"emoji":"🪣","homepage":"https://aws.amazon.com/s3/","requires":{"bins":["aws"]},"install":[{"id":"brew","kind":"brew","formula":"awscli","bins":["aws"]}]}}
---

# S3

Use the AWS CLI to manage S3 buckets and objects.

## When to activate

- User asks to upload, download, or manage files in S3
- User wants to sync local directories with S3
- User needs to manage bucket policies or lifecycle rules
- User asks to generate presigned URLs

## Common operations

| Task | Command |
|------|---------|
| List buckets | `aws s3 ls` |
| List objects | `aws s3 ls s3://bucket/prefix/` |
| Upload file | `aws s3 cp file.txt s3://bucket/` |
| Download file | `aws s3 cp s3://bucket/file.txt .` |
| Sync directory | `aws s3 sync ./local s3://bucket/path` |
| Presigned URL | `aws s3 presign s3://bucket/file.txt` |
