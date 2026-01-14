# Troubleshooting Buildpack Build Failures
**Date**: January 14, 2026
**Project**: inner-chassis-484215-i8
**Issue**: Buildpack builds failing without detailed CLI logs

---

## ✅ What We've Verified (All Correct)

### 1. Configuration Files
- ✅ Dockerfile **REMOVED** (commit 4635be2)
- ✅ .dockerignore **REMOVED** (commit 4635be2)
- ✅ cloudbuild.yaml uses Little Bo Peep's proven pattern
- ✅ next.config.ts has `output: "standalone"`
- ✅ package.json and package-lock.json present

### 2. IAM Permissions
Cloud Build service account (`816746455484@cloudbuild.gserviceaccount.com`) has:
- ✅ `roles/cloudbuild.builds.builder`
- ✅ `roles/artifactregistry.writer`
- ✅ `roles/storage.admin`
- ✅ `roles/run.developer`
- ✅ Secret access to all 3 Supabase secrets

### 3. Enabled APIs
- ✅ `cloudbuild.googleapis.com` (Cloud Build API)
- ✅ `run.googleapis.com` (Cloud Run Admin API)
- ✅ `artifactregistry.googleapis.com` (Artifact Registry API)
- ✅ `secretmanager.googleapis.com` (Secret Manager API)
- ✅ `containerregistry.googleapis.com` (Container Registry API)

### 4. Infrastructure
- ✅ Artifact Registry repository exists: `cloud-run-source-deploy`
- ✅ Secrets exist in Secret Manager
- ✅ Local build succeeds: `npm run build` works perfectly

### 5. Code Quality
- ✅ TypeScript compiles without errors
- ✅ Next.js builds successfully locally
- ✅ All dependencies install correctly locally

---

## ❌ The Problem

Buildpack builds fail during "Building Container" phase with generic error:
```
Building Container...failed
ERROR: (gcloud.run.deploy) Build failed; check build logs for details
```

**Issue**: The detailed buildpack logs showing WHY the build fails are NOT visible via CLI commands.

---

## 🔍 Where to Find the Actual Error

The buildpack creates a nested build that logs to Cloud Logging, not the main Cloud Build logs.

### View Logs in Console (REQUIRED)
1. Open Cloud Build console:
   ```
   https://console.cloud.google.com/cloud-build/builds?project=inner-chassis-484215-i8
   ```

2. Click on latest failed build (e.g., `fe9f21a6-1821-42f5-8670-b559b3b96086`)

3. Click on the "Build" step to expand logs

4. Look for the actual buildpack error, which will show:
   - npm install failures
   - npm run build failures
   - Node version mismatches
   - Missing system dependencies
   - Environment variable issues

### CLI Attempts (All Failed to Show Real Error)
```bash
# These don't show the nested buildpack logs:
gcloud builds log BUILD_ID
gcloud beta builds log BUILD_ID --stream
gcloud logging read "resource.type=build..."
```

---

## 🎯 Likely Causes (To Check in Console)

### 1. Environment Variables Not Available at Build Time
**Symptom**: Build fails with "Invalid supabaseUrl" or similar

**Check**: Do the secrets get injected during npm run build?

**Fix if needed**: Buildpacks might need secrets passed differently than `--update-secrets`

### 2. Node Version Mismatch
**Symptom**: "You are using Node.js XX. For Next.js, version >=20.9.0 is required"

**Local version**:
```bash
node --version  # Should be 20.x or higher
```

**Fix**: Add `.nvmrc` or specify engine in package.json:
```json
{
  "engines": {
    "node": ">=20.9.0",
    "npm": ">=10.0.0"
  }
}
```

### 3. Build Timeout
**Symptom**: Build stops after ~2 minutes

**Current timeout**: 1200s (20 minutes)

**Fix**: Buildpacks might need more memory:
```yaml
options:
  machineType: 'E2_HIGHCPU_8'  # Add this back
```

### 4. Missing System Dependencies
**Symptom**: Native module compilation fails

**Check**: Do any dependencies require system libraries?
- `canvas` needs Cairo
- `sharp` needs libvips
- `node-gyp` needs build tools

**Fix**: May need custom buildpack or Dockerfile (defeats our purpose)

### 5. npm ci Fails
**Symptom**: "npm ci can only install with an existing package-lock.json"

**Status**: ✅ package-lock.json is committed and in sync

### 6. Build Args/Secrets Not Accessible
**Symptom**: Build completes but app crashes with missing env vars

**Current approach**: Using `--update-secrets` (runtime injection)

**Potential issue**: Next.js needs `NEXT_PUBLIC_*` vars at BUILD time, not runtime

**Fix needed**: May need to use `--set-build-env-vars` or pass secrets differently

---

## 🔧 Next Steps

### Step 1: View Console Logs (YOU MUST DO THIS)
Open the Cloud Build console and find the ACTUAL error message:
```
https://console.cloud.google.com/cloud-build/builds/fe9f21a6-1821-42f5-8670-b559b3b96086?project=816746455484
```

### Step 2: Based on Error, Apply Fix

**If "Invalid supabaseUrl":**
```yaml
# Try build-time env vars instead
steps:
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - '--set-build-env-vars=NEXT_PUBLIC_SUPABASE_URL=$$SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY=$$ANON_KEY'
    secretEnv: ['SUPABASE_URL', 'ANON_KEY']

availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/NEXT_PUBLIC_SUPABASE_URL/versions/latest
      env: SUPABASE_URL
```

**If Node version error:**
Add to package.json:
```json
{
  "engines": {
    "node": "20.x"
  }
}
```

**If timeout:**
Add back to cloudbuild.yaml:
```yaml
options:
  machineType: 'E2_HIGHCPU_8'
  logging: CLOUD_LOGGING_ONLY
```

### Step 3: Test Again
After applying fix based on console error, deploy again.

---

## 📊 Build History

| Build ID | Status | Duration | Notes |
|----------|--------|----------|-------|
| fe9f21a6 | FAILURE | 2m4s | Using gcr.io/cloud-builders/gcloud |
| d06dd46a | FAILURE | ~2m | Added Cloud Build SA permissions |
| a17de8d5 | FAILURE | ~2m | Removed Dockerfile |
| 84665301 | FAILURE | ~2m | Various permission attempts |

**Pattern**: All fail quickly (~2min) during "Building Container" phase

---

## 🚨 CRITICAL: Why This Matters

We've eliminated ALL the common causes:
- ✅ No Docker interference
- ✅ Correct permissions
- ✅ All APIs enabled
- ✅ Code builds locally

**The issue is specific to the buildpack environment**, which means:
1. We NEED to see the actual buildpack error logs
2. The CLI doesn't expose these logs
3. The Console DOES show them
4. Once we see the real error, the fix will be obvious

---

## 📝 Commands to Re-Run After Fix

```bash
# 1. Commit the fix
git add .
git commit -m "fix: [describe what you fixed based on console error]"

# 2. Deploy
git push origin main

# 3. Monitor (wait 30 seconds for webhook)
sleep 30
BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")

# 4. Check status every 30 seconds
watch -n 30 "gcloud builds describe $BUILD_ID --format='value(status)'"

# 5. If SUCCESS, get URL
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1 \
  --format="value(status.url)"
```

---

**Status**: Awaiting actual error message from Cloud Build Console
**Next Action**: Check Console logs, identify real error, apply targeted fix
**Confidence**: High that we'll succeed once we see the actual error

**Created**: January 14, 2026
**Last Updated**: January 14, 2026 11:00 UTC
