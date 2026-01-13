# CRITICAL DEPLOYMENT RULES
**Based on Lessons from LittleBopeep Project**

## ⚠️ MUST FOLLOW - These Rules Are NOT Optional

### Rule #1: NEVER Add package-lock.json to .gitignore

**Why**: Docker builds use `npm ci` which REQUIRES `package-lock.json` to exist. Without it, the build will fail with:
```
npm ci can only install with an existing package-lock.json
```

**Status**: ✅ Verified - `package-lock.json` is committed and NOT in `.gitignore`

```bash
# Verify this yourself:
git ls-files package-lock.json  # Should return: package-lock.json
grep "package-lock" .gitignore  # Should return nothing
```

---

### Rule #2: ALWAYS Test Build Locally Before Pushing

**Why**: Cloud Build failures waste time and resources. Local testing catches 99% of issues.

**Required Commands**:
```bash
npm run build  # MUST succeed before pushing
npm run lint   # SHOULD pass
```

**If npm run build fails locally**:
- Fix the errors
- Run `npm run build` again
- Only push when it succeeds

---

### Rule #3: Use Docker Builds, NOT Buildpacks

**Why**: Google Cloud Buildpacks are unreliable for complex Next.js apps and often timeout.

**Status**: ✅ Configured - Using multi-stage Dockerfile

**Dockerfile Configuration**:
- Base Image: `node:20-alpine` (matches Next.js 16 requirements)
- Multi-stage build: deps → builder → runner
- Output mode: `standalone` (in next.config.ts)
- Non-root user for security

---

### Rule #4: Environment Variables for Build

**Why**: Next.js needs certain environment variables during build time (prefixed with `NEXT_PUBLIC_`).

**Status**: ✅ Configured - Using build args in Docker

**Implementation**:
```dockerfile
# In Dockerfile
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
```

```yaml
# In cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build',
      '--build-arg', 'NEXT_PUBLIC_SUPABASE_URL=$$NEXT_PUBLIC_SUPABASE_URL',
      '--build-arg', 'NEXT_PUBLIC_SUPABASE_ANON_KEY=$$NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ...
    ]
    secretEnv: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']

availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/NEXT_PUBLIC_SUPABASE_URL/versions/latest
      env: 'NEXT_PUBLIC_SUPABASE_URL'
    - versionName: projects/$PROJECT_ID/secrets/NEXT_PUBLIC_SUPABASE_ANON_KEY/versions/latest
      env: 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
```

---

### Rule #5: Secrets Must Be in Google Cloud Secret Manager

**Why**: Secrets should NEVER be hardcoded or committed to git.

**Required Secrets**:
```bash
gcloud secrets list
# Should show:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY (for server-side operations)
```

**To Load Secrets Locally**:
```bash
./scripts/load-secrets.sh
```

This creates `.env.local` with all secrets from Google Cloud Secret Manager.

---

### Rule #6: Use Service Account Permissions

**Why**: Cloud Build needs permission to access Secret Manager.

**Verify Permissions**:
```bash
# Grant Secret Manager access to Cloud Build service account
gcloud secrets add-iam-policy-binding NEXT_PUBLIC_SUPABASE_URL \
  --member="serviceAccount:327019541186-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding NEXT_PUBLIC_SUPABASE_ANON_KEY \
  --member="serviceAccount:327019541186-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🚨 Common Build Failures & Solutions

### Failure 1: "npm ci can only install with package-lock.json"

**Solution**:
```bash
# Verify package-lock.json is in git
git ls-files package-lock.json

# If missing, it was added to .gitignore by mistake
sed -i '/package-lock.json/d' .gitignore
git add package-lock.json .gitignore
git commit -m "Fix: Ensure package-lock.json is committed"
git push
```

---

### Failure 2: "You are using Node.js XX. For Next.js, version >=20.9.0 is required"

**Solution**:
```dockerfile
# In Dockerfile, use Node 20:
FROM node:20-alpine AS base  # NOT node:18-alpine
```

**Status**: ✅ Fixed in current Dockerfile

---

### Failure 3: "Missing env.NEXT_PUBLIC_SUPABASE_URL"

**Solution**: Ensure build args are passed correctly in cloudbuild.yaml (see Rule #4 above)

**Status**: ✅ Configured

---

### Failure 4: TypeScript Build Errors

**Solution**:
```bash
# Test locally first
npm run build

# If errors, fix them before pushing
# Common issues:
# - Type mismatches
# - Missing imports
# - Incorrect function signatures
```

---

## ✅ Pre-Push Checklist

Before every `git push`, verify:

1. [ ] `npm run build` succeeds locally
2. [ ] `npm run lint` passes (or at least no new errors)
3. [ ] `package-lock.json` is committed: `git ls-files package-lock.json`
4. [ ] `.env.local` is NOT committed: `git ls-files .env.local` (should be empty)
5. [ ] No secrets hardcoded in files
6. [ ] TypeScript compiles without errors

---

## 📊 Monitoring Deployments

### Watch Build Progress

```bash
# List recent builds
gcloud builds list --limit=5

# Stream logs for latest build
BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")
gcloud builds log $BUILD_ID --stream
```

### View Service Status

```bash
# Check Cloud Run service
gcloud run services describe lineablu-legal-impact-score --region=us-central1

# View logs
gcloud run services logs read lineablu-legal-impact-score --region=us-central1 --limit=50
```

---

## 🎯 Quick Fix Commands

```bash
# If build fails, check logs:
gcloud builds log $(gcloud builds list --limit=1 --format="value(id)") | tail -100

# Re-run secrets script if .env.local is corrupted:
./scripts/load-secrets.sh

# Verify secrets exist:
gcloud secrets list

# Test build locally:
npm run build && echo "✅ Build OK" || echo "❌ Build FAILED - Fix before pushing"
```

---

## 📖 Related Files

- **cloudbuild.yaml** - Build configuration with secret bindings
- **Dockerfile** - Multi-stage Docker build with Node 20
- **next.config.ts** - Must have `output: "standalone"`
- **scripts/load-secrets.sh** - Loads secrets from GC to .env.local
- **SETUP_TRIGGER.md** - Instructions for creating Cloud Build trigger

---

**Last Updated**: January 13, 2026
**Status**: ✅ All critical rules implemented
**Next Step**: Create Cloud Build trigger and test deployment

---

## 🔗 Links

- **Cloud Build Console**: https://console.cloud.google.com/cloud-build/builds?project=little-bo-peep-483820
- **Cloud Run Console**: https://console.cloud.google.com/run?project=little-bo-peep-483820
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=little-bo-peep-483820
- **Supabase Dashboard**: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg

---

**Remember**: These rules come from real production issues. Follow them strictly to avoid wasting hours debugging build failures.
