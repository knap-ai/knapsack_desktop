---
name: Google Cloud
description: Manage Google Cloud Platform resources and services.
metadata: {"clawdbot":{"emoji":"🌐","homepage":"https://cloud.google.com/sdk","requires":{"bins":["gcloud"]},"install":[{"id":"brew","kind":"brew","formula":"google-cloud-sdk","bins":["gcloud","gsutil","bq"]}]}}
---

# Google Cloud

Use the `gcloud` CLI to manage GCP resources.

## When to activate

- User asks to manage GCP compute, storage, or networking
- User wants to deploy to Cloud Run, App Engine, or GKE
- User needs to manage BigQuery, Pub/Sub, or Cloud Functions
- User asks about GCP IAM, billing, or project configuration

## Common operations

| Task | Command |
|------|---------|
| Login | `gcloud auth login` |
| Set project | `gcloud config set project PROJECT_ID` |
| List instances | `gcloud compute instances list` |
| Deploy Cloud Run | `gcloud run deploy` |
| List buckets | `gsutil ls` |
| BigQuery query | `bq query --use_legacy_sql=false 'SELECT ...'` |
