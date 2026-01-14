# LineaBlu Deployment Session Handoff
**Date**: January 14, 2026
**Session**: Automated Deployment Setup
**Status**: 🔄 In Progress - Build Permissions Being Configured

---

## ✅ COMPLETED WORK

### 1. Project Identification & Setup
- **Correct Project**: `inner-chassis-484215-i8` (NOT lineablu-484215 or little-bo-peep)
- **Project Number**: `816746455484`
- **Region**: `us-central1`
- **Service Name**: `lineablu-legal-impact-score`

### 2. Secrets Migration
All secrets copied from `little-bo-peep-483820` to `inner-chassis-484215-i8`:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

```bash
# Verify secrets
gcloud secrets list --project=inner-chassis-484215-i8
```

### 3. Service Account Permissions
Service account `github-actions@inner-chassis-484215-i8.iam.gserviceaccount.com` has been granted:
- ✅ `roles/artifactregistry.admin` - Create/manage Artifact Registry repos
- ✅ `roles/artifactregistry.writer` - Push images
- ✅ `roles/logging.logWriter` - Write build logs
- ✅ `roles/secretmanager.admin` - Access secrets
- ✅ `roles/cloudbuild.builds.editor` - Run builds
- ✅ `roles/run.admin` - Deploy to Cloud Run
- ✅ `roles/storage.admin` - Access Container Registry
- ✅ `roles/serviceusage.serviceUsageConsumer` - Use Google Cloud services
- ✅ `roles/iam.serviceAccountUser` - Act as service account
- ✅ `roles/viewer` - View project resources

Also configured:
- ✅ `816746455484@cloudbuild.gserviceaccount.com` has `roles/cloudbuild.builds.builder`

### 4. Deployment Method Switch
**Original Approach** (FAILED): Docker build with build args
- Issue: Build args for env vars weren't being passed correctly
- Error: "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"

**New Approach** (LittleBoPeep Method): Source-based deployment
- Uses `gcloud run deploy --source=.` instead of Docker
- Passes secrets via `--update-secrets` flag
- File: `cloudbuild.yaml` (simplified version)
- Old Docker approach backed up to: `cloudbuild-docker.yaml.backup`

### 5. Build Configuration Files

**cloudbuild.yaml** (current):
```yaml
steps:
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'lineablu-legal-impact-score'
      - '--source=.'
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--update-secrets=NEXT_PUBLIC_SUPABASE_URL=NEXT_PUBLIC_SUPABASE_URL:latest,NEXT_PUBLIC_SUPABASE_ANON_KEY=NEXT_PUBLIC_SUPABASE_ANON_KEY:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest'
      - '--set-env-vars=NODE_ENV=production'

options:
  machineType: 'E2_HIGHCPU_8'
  logging: CLOUD_LOGGING_ONLY

timeout: '1800s'
```

**Dockerfile** (Node 20, still exists for reference):
- Multi-stage build
- Accepts build args (though not currently used)
- Located at: `/Users/chrissavides/Documents/Lineablu/lineablu-app/Dockerfile`

### 6. Git Repository Configuration
**Repo**: https://github.com/thesavides/lineablu
**Branch**: `main`
**Local Path**: `/Users/chrissavides/Documents/Lineablu/lineablu-app`

**Recent Commits**:
- `9cf54c7` - Trigger build with Artifact Registry permissions
- `8cb75c8` - Switch to source-based deployment (LittleBoPeep method)
- `9d47337` - Trigger build with secrets configured
- `c618452` - Fix: Add CLOUD_LOGGING_ONLY to cloudbuild.yaml
- `8c1e325` - Add critical deployment rules from LittleBoPeep lessons
- `b480efc` - Configure deployment with Node 20 and Supabase secrets

### 7. Documentation Created
- ✅ `LINEABLU-DEPLOYMENT-HANDOFF.md` - Comprehensive deployment guide
- ✅ `CRITICAL-DEPLOYMENT-RULES.md` - Must-follow rules from LittleBoPeep
- ✅ `SETUP_TRIGGER.md` - Cloud Build trigger setup instructions
- ✅ `scripts/load-secrets.sh` - Script to load secrets locally

---

## 🔄 CURRENT STATUS

### Latest Build
**Build ID**: `84665301-db44-48c5-af3d-97fff26522fa`
**Status**: FAILURE
**Reason**: Service account permissions being configured iteratively

**Build History** (most recent first):
1. `84665301` - FAILURE - Missing serviceusage.serviceUsageConsumer role (JUST FIXED)
2. `523c3a77` - FAILURE - Missing artifactregistry.repositories.create permission (FIXED)
3. `debe565a` - FAILURE - Invalid supabaseUrl (build args not working)
4. `0dd11abc` - FAILURE - Same env var issue

### What Was Just Fixed
Added the following permissions (just now):
- `roles/serviceusage.serviceUsageConsumer` to `github-actions@inner-chassis-484215-i8.iam.gserviceaccount.com`
- `roles/cloudbuild.builds.builder` to `816746455484@cloudbuild.gserviceaccount.com`

---

## 🎯 NEXT STEPS

### Immediate Next Action
Trigger a new build to test with all permissions in place:

```bash
cd /Users/chrissavides/Documents/Lineablu/lineablu-app
git commit --allow-empty -m "Test build with all permissions configured"
git push origin main
```

### Monitor Build
```bash
# Wait 20 seconds for webhook to trigger
sleep 20

# Check latest build
gcloud builds list --project=inner-chassis-484215-i8 --limit=1 --format="table(id,status,createTime)"

# Get build ID and monitor
BUILD_ID=$(gcloud builds list --project=inner-chassis-484215-i8 --limit=1 --format="value(id)")
gcloud beta builds log $BUILD_ID --stream --project=inner-chassis-484215-i8
```

### If Build Succeeds
1. Get service URL:
   ```bash
   gcloud run services describe lineablu-legal-impact-score \
     --region=us-central1 \
     --project=inner-chassis-484215-i8 \
     --format="value(status.url)"
   ```

2. Test the application:
   ```bash
   curl [SERVICE_URL]
   ```

3. Open in browser and verify assessment tool loads

### If Build Still Fails
Check error with:
```bash
BUILD_ID=$(gcloud builds list --project=inner-chassis-484215-i8 --limit=1 --format="value(id)")
gcloud builds log $BUILD_ID --project=inner-chassis-484215-i8 2>&1 | grep -A 30 "ERROR"
```

Common issues to check:
- [ ] Service account permissions (add missing roles)
- [ ] API enablement (`gcloud services list --enabled`)
- [ ] Secret access (verify service account can access secrets)

---

## 📋 CRITICAL INFORMATION FOR NEXT SESSION

### Always Use Correct Project
```bash
# Set project (DO THIS FIRST)
gcloud config set project inner-chassis-484215-i8

# Verify
gcloud config get-value project  # Should show: inner-chassis-484215-i8
```

### Cloud Build Trigger
- **Trigger exists**: Created via Console (gcloud commands don't show it, but it's there)
- **Trigger location**: https://console.cloud.google.com/cloud-build/triggers?project=inner-chassis-484215-i8
- **Webhook**: Configured for GitHub `thesavides/lineablu` repo on `main` branch

### Service Accounts
Two service accounts are involved:

1. **github-actions@inner-chassis-484215-i8.iam.gserviceaccount.com**
   - Used by Cloud Build trigger
   - Has most permissions listed above

2. **816746455484@cloudbuild.gserviceaccount.com**
   - Cloud Build default service account
   - Has `roles/cloudbuild.builds.builder`

### Secrets Location
All in `inner-chassis-484215-i8` project (NOT little-bo-peep):
```bash
gcloud secrets list --project=inner-chassis-484215-i8
```

To load locally:
```bash
cd /Users/chrissavides/Documents/Lineablu/lineablu-app
./scripts/load-secrets.sh
```

---

## 🐛 KNOWN ISSUES & SOLUTIONS

### Issue 1: Docker Build Args Don't Work
**Symptom**: "Invalid supabaseUrl" during build
**Cause**: Docker build args with `$$VAR` syntax don't pass correctly
**Solution**: Use source-based deployment with `--update-secrets` (IMPLEMENTED)

### Issue 2: Permission Errors
**Symptom**: "Permission denied" on various operations
**Solution**: Grant specific role to service account
**Pattern**:
```bash
gcloud projects add-iam-policy-binding inner-chassis-484215-i8 \
  --member="serviceAccount:github-actions@inner-chassis-484215-i8.iam.gserviceaccount.com" \
  --role="roles/ROLE_NAME"
```

### Issue 3: Secrets Not Found
**Symptom**: Secrets don't exist in project
**Solution**: Copy from little-bo-peep-483820:
```bash
gcloud secrets versions access latest --secret="SECRET_NAME" --project=little-bo-peep-483820 | \
  gcloud secrets create SECRET_NAME --data-file=- --project=inner-chassis-484215-i8
```

---

## 📊 BUILD PROGRESS TRACKER

| Attempt | Build ID | Issue | Fix | Status |
|---------|----------|-------|-----|--------|
| 1 | 0dd11abc | Invalid supabaseUrl | Try Docker build args | ❌ |
| 2 | debe565a | Invalid supabaseUrl | Add secrets to cloudbuild.yaml | ❌ |
| 3 | 523c3a77 | Missing artifactregistry permission | Add artifactregistry.admin | ❌ |
| 4 | 84665301 | Missing serviceusage permission | Add serviceusageConsumer | ❌ |
| 5 | TBD | TBD | All permissions now granted | ⏳ |

---

## 🔗 QUICK LINKS

### Google Cloud Console
- **Builds**: https://console.cloud.google.com/cloud-build/builds?project=inner-chassis-484215-i8
- **Triggers**: https://console.cloud.google.com/cloud-build/triggers?project=inner-chassis-484215-i8
- **Cloud Run**: https://console.cloud.google.com/run?project=inner-chassis-484215-i8
- **Secrets**: https://console.cloud.google.com/security/secret-manager?project=inner-chassis-484215-i8
- **IAM**: https://console.cloud.google.com/iam-admin/iam?project=inner-chassis-484215-i8

### GitHub
- **Repository**: https://github.com/thesavides/lineablu
- **Latest Commit**: https://github.com/thesavides/lineablu/commit/9cf54c7

### Supabase
- **Dashboard**: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg
- **Project Ref**: `oyfikxdowpekmcxszbqg`

---

## 🎯 SUCCESS CRITERIA

Deployment will be successful when:
- [ ] Build completes without errors
- [ ] Service deploys to Cloud Run
- [ ] Service URL is accessible
- [ ] Assessment tool loads in browser
- [ ] Supabase connection works
- [ ] No console errors

---

## 📝 COMMANDS CHEAT SHEET

```bash
# Set project
gcloud config set project inner-chassis-484215-i8

# Trigger new build
cd /Users/chrissavides/Documents/Lineablu/lineablu-app
git commit --allow-empty -m "Test deployment"
git push origin main

# Monitor builds
gcloud builds list --project=inner-chassis-484215-i8 --limit=5
BUILD_ID=$(gcloud builds list --project=inner-chassis-484215-i8 --limit=1 --format="value(id)")
gcloud beta builds log $BUILD_ID --stream --project=inner-chassis-484215-i8

# Check service
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1 \
  --project=inner-chassis-484215-i8

# Get service URL
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1 \
  --project=inner-chassis-484215-i8 \
  --format="value(status.url)"

# View secrets
gcloud secrets list --project=inner-chassis-484215-i8

# Load secrets locally
./scripts/load-secrets.sh

# Check service account permissions
gcloud projects get-iam-policy inner-chassis-484215-i8 \
  --flatten="bindings[].members" \
  --filter="bindings.members:github-actions@inner-chassis-484215-i8.iam.gserviceaccount.com" \
  --format="table(bindings.role)"
```

---

## 🚨 IMPORTANT REMINDERS

1. **ALWAYS verify project**: `gcloud config get-value project`
2. **Test builds locally first**: `cd lineablu-app && npm run build`
3. **package-lock.json MUST be committed** (already done ✅)
4. **Never commit .env.local** (already in .gitignore ✅)
5. **Use source deployment, not Docker** (for env var issues)

---

## 📚 RELATED DOCUMENTATION

In `/Users/chrissavides/Documents/Lineablu/lineablu-app/`:
- `LINEABLU-DEPLOYMENT-HANDOFF.md` - Complete deployment guide
- `CRITICAL-DEPLOYMENT-RULES.md` - Must-follow rules
- `SETUP_TRIGGER.md` - Trigger setup instructions
- `TECHNICAL_HANDOFF.md` - Original specification
- `scripts/load-secrets.sh` - Load secrets script

---

**Last Updated**: January 14, 2026 10:30 UTC
**Critical Fix Applied**: Removed Dockerfile (commit 4635be2)
**Next Action**: Push and deploy with buildpacks
**Expected Result**: IMMEDIATE SUCCESS (like Little Bo Peep after Docker removal)

---

## 🚨 CRITICAL LESSON LEARNED

**The Problem Was NOT Permissions - It Was Docker**

After reviewing Little Bo Peep deployment history, we discovered:
- Little Bo Peep had 10+ failed builds over 2+ hours
- Root cause: Dockerfile interfering with buildpacks
- Solution: Remove Dockerfile entirely
- Result: IMMEDIATE SUCCESS

**LineaBlu Had the Same Issue:**
- 5+ failed builds (commits before 4635be2)
- We kept adding permissions (which were already correct)
- Real issue: `gcloud run deploy --source=.` was detecting Dockerfile and using Docker mode
- **Fix Applied**: Removed Dockerfile and .dockerignore in commit 4635be2

**READ THIS**: `CRITICAL-DEPLOYMENT-RULES.md` - Contains all deployment lessons from Little Bo Peep

---

## 🎬 RESUME SESSION

To resume this session:

1. **FIRST: Read the critical deployment rules**
   ```bash
   cat CRITICAL-DEPLOYMENT-RULES.md
   ```

2. Set project:
   ```bash
   gcloud config set project inner-chassis-484215-i8
   ```

3. Navigate to app:
   ```bash
   cd /Users/chrissavides/Documents/Lineablu/lineablu-app
   ```

4. Verify Dockerfile is gone:
   ```bash
   [ ! -f Dockerfile ] && echo "✅ Ready to deploy" || echo "❌ Remove Dockerfile first"
   ```

5. Check latest build status:
   ```bash
   gcloud builds list --project=inner-chassis-484215-i8 --limit=1
   ```

6. Deploy (should succeed now with buildpacks):
   ```bash
   git push origin main
   ```

7. Monitor build:
   ```bash
   sleep 20  # Wait for webhook
   BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")
   gcloud builds log $BUILD_ID --stream
   ```

---

**Status**: ✅ Critical fix applied - Dockerfile removed, buildpacks enabled
**Confidence**: High (exact same fix worked for Little Bo Peep)
**Reference**: See CRITICAL-DEPLOYMENT-RULES.md for full history
