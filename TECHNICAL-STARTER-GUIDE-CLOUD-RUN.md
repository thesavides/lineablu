# Technical Starter Guide - Next.js + Supabase + Google Cloud Run
**Purpose**: Complete deployment criteria and standards for Next.js + Supabase + Cloud Run projects
**Based on**: Little Bo Peep (successful) and LineaBlu (lessons learned)
**Last Updated**: January 16, 2026

---

## 🚀 AUTOMATED END-TO-END DEPLOYMENT

This guide documents the **proven, automated deployment pipeline** for Next.js + Supabase applications to Google Cloud Run. Claude has **full CLI access** to all environments and can execute deployments autonomously.

### Deployment Architecture

```
GitHub Repository
     ↓ (git push)
GitHub Actions (optional CI/CD trigger)
     ↓
Google Cloud Build
     ↓ (buildpacks auto-detect)
Container Registry
     ↓
Google Cloud Run
     ↓
Live Application (with Supabase backend)
```

### Key Principles
1. ✅ **Buildpacks ONLY** - No Docker, no Dockerfile, no docker-compose
2. ✅ **JavaScript CommonJS** - All config files must be `.js` with `module.exports`
3. ✅ **Secret Manager** - All credentials stored in Google Cloud Secret Manager
4. ✅ **Automated Testing** - `npm run build` must pass locally before deployment
5. ✅ **Full CLI Access** - Claude has authenticated access to: gcloud, git, Supabase CLI

### Environment Access

Claude has full authenticated CLI access to:
- ✅ **Google Cloud** (`gcloud`) - Project: `inner-chassis-484215-i8`
- ✅ **Git/GitHub** - Repository: `https://github.com/thesavides/lineablu.git`
- ✅ **Supabase** - Database and Auth services
- ✅ **npm** - Package management and builds

**No manual intervention required** - Claude can execute full deployment cycle autonomously.

---

## 🎯 GOLDEN RULES - READ THIS FIRST

### Rule #1: Use JavaScript CommonJS for ALL Config Files
❌ **NEVER**: TypeScript config files (`.ts`)
❌ **NEVER**: ES Module config files (`.mjs`)
✅ **ALWAYS**: JavaScript CommonJS (`.js` with `module.exports`)

**Why**: Google Cloud Buildpacks cannot detect projects with TypeScript/ESM configs

### Rule #2: Use Buildpacks, NEVER Docker
❌ **NEVER**: Create Dockerfile for deployment
❌ **NEVER**: Use Docker build args
❌ **NEVER**: Use docker-compose for Cloud Run
❌ **NEVER**: Add `.dockerignore` files
❌ **NEVER**: Add `project.toml` with manual buildpack definitions
✅ **ALWAYS**: Use `gcloud run deploy --source=.`
✅ **ALWAYS**: Let buildpacks auto-detect the project

**Why**: Buildpacks work reliably and auto-detect correctly. Docker causes 2+ hours of debugging. Manual buildpack configuration breaks detection.

**Critical Lesson from LineaBlu**: We tried Docker repeatedly and it failed every time. Switching to buildpacks with `--source=.` resolved all deployment issues immediately.

### Rule #3: Test Locally Before EVERY Push
✅ **ALWAYS**: Run `npm run build` locally first
✅ **ALWAYS**: Verify build succeeds before pushing
❌ **NEVER**: Push code that doesn't build locally

**Why**: Prevents wasted CI/CD time and catches errors early

### Rule #4: Store ALL Secrets in Google Cloud Secret Manager
✅ **ALWAYS**: Use Secret Manager for secrets
❌ **NEVER**: Hardcode secrets in code or markdown files
❌ **NEVER**: Commit `.env` files with real secrets

**Why**: Security and GitHub push protection

### Rule #5: Compare with Working Reference When Stuck
✅ **ALWAYS**: Reference Little Bo Peep when stuck
✅ **ALWAYS**: Compare ENTIRE setup, not just one file
❌ **NEVER**: Repeat same failed deployment more than 3 times

**Why**: Holistic comparison finds root causes faster

---

## 📁 Project Structure Template

```
your-project/
├── app/                      # Next.js App Router (or pages/)
│   ├── globals.css
│   ├── layout.tsx           # App code CAN be TypeScript
│   └── page.tsx
├── components/
│   └── YourComponent.tsx    # App code CAN be TypeScript
├── lib/
│   └── supabase.ts          # App code CAN be TypeScript
├── public/
│   └── assets/
├── .env.example             # Template with placeholder values
├── .env.local               # LOCAL ONLY - in .gitignore
├── .gitignore               # Must include .env.local
├── cloudbuild.yaml          # ✅ Cloud Build config (see below)
├── next.config.js           # ✅ MUST be .js (CommonJS)
├── postcss.config.js        # ✅ MUST be .js (CommonJS)
├── tailwind.config.js       # ✅ MUST be .js (CommonJS)
├── package.json             # Include engines field
├── package-lock.json        # MUST commit this
├── tsconfig.json            # TypeScript config for app code (OK)
└── README.md

❌ NO Dockerfile
❌ NO .dockerignore
❌ NO TypeScript config files
```

---

## 📝 Required Configuration Files

### 1. next.config.js (JavaScript CommonJS)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // Required for Cloud Run
  reactStrictMode: true,
};

module.exports = nextConfig;
```

**Critical**:
- Must use `.js` extension
- Must use `module.exports`
- Must have `output: 'standalone'`

---

### 2. postcss.config.js (JavaScript CommonJS)

**For Tailwind v3**:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**For Tailwind v4**:
```javascript
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

---

### 3. tailwind.config.js (JavaScript CommonJS)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

### 4. package.json (with engines field)
```json
{
  "name": "your-project",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "engines": {
    "node": ">=20.9.0",
    "npm": ">=10.0.0"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

**Critical Notes**:
- `package-lock.json` MUST be committed
- **Next.js Version**: Use Next.js 14.x - proven stable with Cloud Run buildpacks
- **React Version**: Use React 18.x (React 19 has compatibility issues with some libraries)
- **Node Version**: >=20.9.0 required for Next.js 14+
- Avoid version ranges (^15.0.0 || ^16.0.0) for production stability

---

### 5. cloudbuild.yaml (Proven Pattern)
```yaml
# Based on Little Bo Peep's successful deployment
# DO NOT MODIFY THIS PATTERN

steps:
  # Deploy to Cloud Run using buildpacks
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'YOUR-SERVICE-NAME'  # Change this
      - '--source=.'
      - '--region=us-central1'  # Or your region
      - '--platform=managed'
      - '--allow-unauthenticated'  # Or remove for auth required
      - '--project=$PROJECT_ID'
      - '--clear-env-vars'
      - '--update-secrets=NEXT_PUBLIC_SUPABASE_URL=NEXT_PUBLIC_SUPABASE_URL:latest,NEXT_PUBLIC_SUPABASE_ANON_KEY=NEXT_PUBLIC_SUPABASE_ANON_KEY:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest'

options:
  logging: CLOUD_LOGGING_ONLY

timeout: '1200s'
```

**Critical Points**:
- Uses `gcr.io/cloud-builders/gcloud`
- Uses `--source=.` (buildpacks, NOT Docker)
- Uses `--update-secrets` for environment variables
- Has `--clear-env-vars` before setting secrets
- Has `--project=$PROJECT_ID`

---

### 6. .gitignore (Required Entries)
```gitignore
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment variables (NEVER COMMIT)
.env
.env.local
.env.production
.env.*.local

# OS
.DS_Store

# IDE
.vscode/
.idea/

# Logs
npm-debug.log*
yarn-debug.log*
```

---

## 🔐 Secrets Management

### Critical Pattern: Placeholder Values for Build-Time

**Problem**: Next.js build process tries to execute route handlers during build, which import Supabase client. If environment variables are empty, Supabase client validation fails.

**Solution**: Use placeholder values in code, real values injected at runtime.

```typescript
// lib/supabase.ts - PROVEN PATTERN
import { createClient } from '@supabase/supabase-js';

// Placeholder values satisfy build-time validation
// Real values injected at runtime via Secret Manager
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyODAwLCJleHAiOjE5NjA3Njg4MDB9.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Why This Works**:
- Build-time: Placeholder values satisfy Supabase client validation
- Runtime: Real credentials from Secret Manager override placeholders
- Empty strings fail validation (DON'T USE)

### Setup Process

1. **Create secrets in Google Cloud Secret Manager**:
```bash
# Set your project
gcloud config set project YOUR-PROJECT-ID

# Create secrets
echo -n "YOUR_SUPABASE_URL" | gcloud secrets create NEXT_PUBLIC_SUPABASE_URL --data-file=-
echo -n "YOUR_ANON_KEY" | gcloud secrets create NEXT_PUBLIC_SUPABASE_ANON_KEY --data-file=-
echo -n "YOUR_SERVICE_ROLE_KEY" | gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-

# Verify
gcloud secrets list
```

2. **Grant access to Cloud Build service account**:
```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe YOUR-PROJECT-ID --format="value(projectNumber)")

# Grant access to each secret
for SECRET in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

3. **Create .env.local for local development** (NOT committed):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🔧 IAM Permissions Setup

### Required Permissions for Cloud Build Service Account

The Cloud Build SA (`PROJECT_NUMBER@cloudbuild.gserviceaccount.com`) needs:

```bash
PROJECT_ID="YOUR-PROJECT-ID"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA" \
  --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA" \
  --role="roles/run.developer"
```

**Verify**:
```bash
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:$SA" \
  --format="table(bindings.role)"
```

Should show:
- roles/cloudbuild.builds.builder
- roles/artifactregistry.writer
- roles/storage.admin
- roles/run.developer

---

## 🤖 CLAUDE'S DEPLOYMENT PROCESS

When Claude deploys changes, this is the exact process followed:

### Step 1: Read and Understand Changes
- Review user request and specifications
- Read relevant files to understand current implementation
- Identify files that need modification

### Step 2: Implement Changes
- Use Edit tool for existing files
- Use Write tool for new files (rare - prefer editing)
- Follow all golden rules (JS CommonJS, no Docker, etc.)

### Step 3: Test Locally
```bash
cd /Users/chrissavides/Documents/Lineablu/lineablu-app
npm run build
```
- MUST succeed before proceeding
- Catches TypeScript errors, missing dependencies, build failures

### Step 4: Commit to Git
```bash
git add -A
git commit -m "Descriptive commit message explaining what changed and why"
```
- Commit message describes the change clearly
- Includes rationale when relevant

### Step 5: Push to GitHub
```bash
git push origin main
```
- Triggers GitHub Actions (if configured)
- Or triggers Cloud Build directly

### Step 6: Monitor Deployment
- GitHub Actions → Cloud Build → Cloud Run
- Automatic deployment via buildpacks
- No manual intervention required

### Step 7: Verify Success
- Deployment typically takes 2-3 minutes
- Service automatically updated at: `https://lineablu-legal-impact-score-816746455484.us-central1.run.app`

**Total Time**: 3-5 minutes from code change to live deployment

---

## 🚀 Deployment Workflow

### Initial Setup (One Time)

1. **Enable APIs**:
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

2. **Create Artifact Registry repository** (auto-created on first deploy, but can pre-create):
```bash
gcloud artifacts repositories create cloud-run-source-deploy \
  --repository-format=docker \
  --location=us-central1
```

3. **Set up secrets** (see Secrets Management section above)

4. **Grant IAM permissions** (see IAM section above)

### Deployment Process (Every Time)

1. **Test locally**:
```bash
npm install
npm run build  # MUST succeed
```

2. **Commit and push**:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

3. **Monitor build**:
```bash
# List recent builds
gcloud builds list --limit=5

# Get latest build ID
BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")

# Check status
gcloud builds describe $BUILD_ID --format="value(status)"

# View logs
gcloud builds log $BUILD_ID
```

4. **Get service URL** (after success):
```bash
gcloud run services describe YOUR-SERVICE-NAME \
  --region=us-central1 \
  --format="value(status.url)"
```

---

## 🔍 Troubleshooting Guide

### Build Fails with "No buildpack groups passed detection"

**Cause**: TypeScript or ES Module config files

**Solution**:
1. Check all config files are `.js` (not `.ts` or `.mjs`)
2. Check all configs use `module.exports` (not `export default`)
3. Convert:
   - `next.config.ts` → `next.config.js`
   - `postcss.config.mjs` → `postcss.config.js`
   - `tailwind.config.ts` → `tailwind.config.js`

### Build Fails with "npm ci can only install with package-lock.json"

**Cause**: `package-lock.json` not committed or in `.gitignore`

**Solution**:
```bash
# Remove from .gitignore if present
sed -i '' '/package-lock.json/d' .gitignore

# Add and commit
git add package-lock.json .gitignore
git commit -m "Add package-lock.json"
git push
```

### Secrets Not Available in Application

**Cause**: Secrets not properly injected or SA lacks access

**Solution**:
1. Verify secrets exist: `gcloud secrets list`
2. Verify SA has access (see IAM section)
3. Check `cloudbuild.yaml` has correct secret names in `--update-secrets`
4. Secrets must be named exactly as referenced

### Build Succeeds But App Crashes

**Cause**: Runtime environment variables missing

**Check**:
```bash
# View service configuration
gcloud run services describe YOUR-SERVICE-NAME \
  --region=us-central1 \
  --format=yaml
```

Look for `env:` and `secrets:` sections

### Permission Denied Errors

**Cause**: Missing IAM roles

**Solution**: Follow IAM Permissions Setup section above

---

## ✅ Pre-Deployment Checklist

Before pushing to deploy:

### Configuration Files
- [ ] `next.config.js` exists (NOT `.ts`)
- [ ] `postcss.config.js` exists (NOT `.mjs`)
- [ ] `tailwind.config.js` exists (NOT `.ts`)
- [ ] All configs use `module.exports`
- [ ] `next.config.js` has `output: 'standalone'`
- [ ] `package.json` has `engines` field
- [ ] `package-lock.json` is committed
- [ ] NO `Dockerfile` in repository
- [ ] NO `.dockerignore` in repository

### Secrets
- [ ] All secrets in Secret Manager
- [ ] Cloud Build SA has `secretAccessor` on all secrets
- [ ] `.env.local` in `.gitignore`
- [ ] NO secrets hardcoded in code
- [ ] `cloudbuild.yaml` references correct secret names

### Permissions
- [ ] Cloud Build SA has required roles
- [ ] Artifact Registry exists or will auto-create
- [ ] Required APIs enabled

### Testing
- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors
- [ ] No linting errors (or acceptable)

### Git
- [ ] `.gitignore` includes `.env.local`
- [ ] No sensitive files committed
- [ ] Commit message is clear

---

## 📊 Success Metrics

After first deployment:

✅ Build status: SUCCESS
✅ Service deployed to Cloud Run
✅ Service URL accessible
✅ Application loads without errors
✅ Secrets properly injected (check logs if needed)
✅ No permission errors in logs

---

## 🎓 Lessons Learned (LineaBlu & Little Bo Peep)

### What Works
✅ JavaScript CommonJS config files (`.js` with `module.exports`)
✅ Buildpacks deployment (`--source=.`) - auto-detection
✅ Secrets via `--update-secrets` flag
✅ Placeholder values for Supabase client at build-time
✅ Testing locally (`npm run build`) before every push
✅ Following proven patterns exactly
✅ Holistic comparison when stuck (compare entire setup)
✅ Next.js 14.x + React 18.x (stable combination)
✅ Automated end-to-end deployment (no manual steps)

### What Doesn't Work
❌ TypeScript config files (`.ts`) - buildpacks fail detection
❌ ES Module config files (`.mjs`) - buildpacks fail detection
❌ Docker with Dockerfile - 2+ hours of debugging, never worked
❌ project.toml with manual buildpack definitions - breaks auto-detection
❌ Empty strings for Supabase credentials - fails validation
❌ Hardcoded secrets in code
❌ Skipping local testing - wastes CI/CD time
❌ Repeating failed deployments without root cause analysis
❌ Assuming newer patterns (Next.js 15, React 19) work without testing
❌ Version ranges in dependencies - causes unpredictable builds

### Critical Deployment Blockers Solved
1. **Docker Failures** → Switched to buildpacks with `--source=.`
2. **TypeScript Config Detection Failures** → Converted all to `.js` CommonJS
3. **Supabase Build-Time Errors** → Added placeholder credentials pattern
4. **Secret Access Failures** → Proper IAM permissions for Cloud Build SA
5. **Version Conflicts** → Pinned to Next.js 14.x + React 18.x

### Time Saved
- **Following this guide**: 30-60 minutes to working deployment
- **Not following this guide**: 4-6 hours of debugging (LineaBlu experience)
- **Total deployments without issues**: After implementing these rules, 100% success rate

### Deployment Success Metrics (LineaBlu)
- **Initial deployment attempts with Docker**: 10+ failures over 4 hours
- **After switching to buildpacks**: First attempt success
- **Subsequent deployments**: 20+ successful deployments with zero failures
- **Average deployment time**: 2-3 minutes from push to live

---

## 📖 Reference Projects

### Little Bo Peep (Working Reference)
- **Location**: `/Users/chrissavides/Documents/Little Bo Peep/`
- **Status**: Successfully deployed and working
- **Use For**: Config file patterns, cloudbuild.yaml reference

### Key Reference Files
- `CRITICAL-DEPLOYMENT-RULES.md` - Deployment rules
- `CRITICAL-DEPLOYMENT-MEMORY.md` - Translation system lessons
- `KEY-LESSONS-DEPLOYMENT-DATABASE.md` - Database lessons

---

## 🚨 Emergency Recovery

If deployment breaks after it was working:

1. **Check what changed**:
```bash
git log --oneline -5
git diff HEAD~1
```

2. **Common breaking changes**:
   - Config file renamed to `.ts` or `.mjs`
   - Dockerfile added
   - Secrets changed/removed
   - Permission changes

3. **Revert to last working commit**:
```bash
git revert HEAD
git push origin main
```

4. **Or restore specific files**:
```bash
# Restore config files from last working commit
git checkout LAST_WORKING_COMMIT -- next.config.js postcss.config.js tailwind.config.js
git commit -m "Restore working config files"
git push
```

---

## 📞 Quick Reference Commands

```bash
# Set project
gcloud config set project YOUR-PROJECT-ID

# Check recent builds
gcloud builds list --limit=5

# Get latest build status
gcloud builds describe $(gcloud builds list --limit=1 --format="value(id)")

# View logs
gcloud builds log $(gcloud builds list --limit=1 --format="value(id)")

# Get service URL
gcloud run services list

# Check secrets
gcloud secrets list

# Check IAM
gcloud projects get-iam-policy YOUR-PROJECT-ID | grep cloudbuild

# Test locally
npm run build
```

---

---

## 🎯 DEPLOYMENT CRITERIA SUMMARY

### Environment Access (Claude)
- ✅ Full gcloud CLI access (authenticated to `inner-chassis-484215-i8`)
- ✅ Full git/GitHub access (push/pull to `thesavides/lineablu`)
- ✅ Full Supabase CLI access
- ✅ Full npm access for builds

### Technical Standards
- ✅ **No Docker** - Buildpacks only with `--source=.`
- ✅ **JavaScript CommonJS** - All config files `.js` with `module.exports`
- ✅ **Next.js 14.x + React 18.x** - Proven stable versions
- ✅ **Placeholder pattern** - Supabase client with build-time placeholders
- ✅ **Secret Manager** - All credentials in GCP Secret Manager
- ✅ **Local testing** - `npm run build` before every deployment

### Deployment Flow
1. Code changes → Local build test → Git commit → Git push
2. GitHub → Cloud Build (buildpacks) → Container Registry → Cloud Run
3. 2-3 minutes from push to live
4. Zero manual steps, fully automated

### Success Rate
- **Before these standards**: ~10% success rate, 4+ hours debugging
- **After these standards**: 100% success rate, <5 minutes per deployment
- **Total successful deployments**: 20+ with zero failures since implementation

---

**Key Takeaway**: Use JavaScript CommonJS for config files, buildpacks for deployment, and Secret Manager for secrets. Test locally first. Reference Little Bo Peep when stuck. Simple, proven patterns work best. Avoid Docker, TypeScript configs, and version ranges.

**Last Updated**: January 16, 2026
**Based On**: Little Bo Peep (working) + LineaBlu (lessons learned)
**Deployment Success**: 100% after implementing these standards
**Maintained By**: Chris Savides

---

## 📚 Additional Documentation

- **DEPLOYMENT_HANDOFF_JAN14_2026.md** - Complete implementation history and Phase 4 updates
- **REFRAMING_BRIEF.md** - Opportunity-based assessment reframing
- **RESULTS_PAGE_SPECIFICATION.md** - Percentage-based scoring design spec
- **LANDING_PAGE_VISUAL_SPEC.md** - Landing page messaging
