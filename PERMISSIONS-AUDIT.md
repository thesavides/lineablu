# LineaBlu Permissions Audit
**Date**: January 14, 2026
**Project**: inner-chassis-484215-i8
**Status**: ✅ All permissions configured

---

## Cloud Build Service Account Permissions

**Service Account**: `816746455484@cloudbuild.gserviceaccount.com`

### Project-Level IAM Roles
- ✅ `roles/cloudbuild.builds.builder` - Build and execute Cloud Build tasks
- ✅ `roles/artifactregistry.writer` - Push images to Artifact Registry
- ✅ `roles/storage.admin` - Access Cloud Storage for build artifacts
- ✅ `roles/run.developer` - Deploy services to Cloud Run

### Secret Manager Access
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - secretAccessor permission
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - secretAccessor permission
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - secretAccessor permission

---

## GitHub Actions Service Account

**Service Account**: `github-actions@inner-chassis-484215-i8.iam.gserviceaccount.com`

### Project-Level IAM Roles
- ✅ `roles/artifactregistry.admin`
- ✅ `roles/artifactregistry.writer`
- ✅ `roles/cloudbuild.builds.editor`
- ✅ `roles/iam.serviceAccountUser`
- ✅ `roles/logging.logWriter`
- ✅ `roles/run.admin`
- ✅ `roles/secretmanager.admin`
- ✅ `roles/serviceusage.serviceUsageConsumer`
- ✅ `roles/storage.admin`
- ✅ `roles/viewer`

---

## Enabled APIs

- ✅ `artifactregistry.googleapis.com` - Artifact Registry API
- ✅ `cloudbuild.googleapis.com` - Cloud Build API
- ✅ `run.googleapis.com` - Cloud Run Admin API
- ✅ `storage.googleapis.com` - Cloud Storage API
- ✅ `storage-api.googleapis.com` - Google Cloud Storage JSON API
- ✅ `storage-component.googleapis.com` - Cloud Storage Component

---

## Artifact Registry

**Repository**: `cloud-run-source-deploy`
- Location: `us-central1`
- Format: DOCKER
- Status: ✅ Exists

---

## Secrets

All secrets exist in Secret Manager:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

## Deployment Configuration

**cloudbuild.yaml**:
- ✅ Using buildpacks (`--source=.`)
- ✅ NO Dockerfile (removed in commit 4635be2)
- ✅ Secrets passed via `--update-secrets`
- ✅ Machine type: E2_HIGHCPU_8
- ✅ Timeout: 1800s (30 minutes)

---

## Permission Changes Made Today

1. **Added to `816746455484@cloudbuild.gserviceaccount.com`:**
   - `roles/artifactregistry.writer` (for pushing images)
   - `roles/storage.admin` (for build artifacts)
   - `roles/run.developer` (for Cloud Run deployment)

2. **Secret Access Granted:**
   - `NEXT_PUBLIC_SUPABASE_URL` → secretAccessor
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → secretAccessor
   - `SUPABASE_SERVICE_ROLE_KEY` → secretAccessor

---

## Verification Commands

```bash
# Verify Cloud Build service account roles
gcloud projects get-iam-policy inner-chassis-484215-i8 \
  --flatten="bindings[].members" \
  --filter="bindings.members:816746455484@cloudbuild.gserviceaccount.com" \
  --format="table(bindings.role)"

# Verify secret access
gcloud secrets get-iam-policy NEXT_PUBLIC_SUPABASE_URL --format=json | grep cloudbuild

# Check Artifact Registry
gcloud artifacts repositories list --location=us-central1

# Verify enabled APIs
gcloud services list --enabled
```

---

## Expected Deployment Flow

1. Push code to GitHub → triggers webhook
2. Cloud Build receives webhook → starts build
3. Cloud Build service account authenticates
4. Buildpacks detect Next.js project
5. `npm install` runs
6. `npm run build` runs
7. Image built and pushed to Artifact Registry (`cloud-run-source-deploy`)
8. Secrets injected as environment variables
9. Service deployed to Cloud Run (`lineablu-legal-impact-score`)
10. Rolling update with zero downtime

---

**Status**: All permissions verified ✅
**Ready for deployment**: Yes
**Last updated**: January 14, 2026 10:45 UTC
