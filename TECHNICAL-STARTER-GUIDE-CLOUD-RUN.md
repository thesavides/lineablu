# Technical Starter Guide - Next.js + Supabase + Google Cloud Run
**Purpose**: Prevent deployment pain in future projects
**Based on**: Little Bo Peep (successful) and LineaBlu (lessons learned)
**Last Updated**: January 14, 2026

---

## 🎯 Golden Rules - READ THIS FIRST

### Rule #1: Use JavaScript CommonJS for ALL Config Files
❌ **NEVER**: TypeScript config files (`.ts`)
❌ **NEVER**: ES Module config files (`.mjs`)
✅ **ALWAYS**: JavaScript CommonJS (`.js` with `module.exports`)

**Why**: Google Cloud Buildpacks cannot detect projects with TypeScript/ESM configs

### Rule #2: Use Buildpacks, NEVER Docker
❌ **NEVER**: Create Dockerfile for deployment
❌ **NEVER**: Use Docker build args
✅ **ALWAYS**: Use `gcloud run deploy --source=.`

**Why**: Buildpacks work reliably, Docker causes 2+ hours of debugging

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
    "next": "^14.0.0 || ^15.0.0 || ^16.0.0",
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "@supabase/supabase-js": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0 || ^19.0.0",
    "@types/react-dom": "^18.0.0 || ^19.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0 || ^4.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

**Note**: `package-lock.json` MUST be committed

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
✅ JavaScript CommonJS config files
✅ Buildpacks deployment (`--source=.`)
✅ Secrets via `--update-secrets` flag
✅ Testing locally before pushing
✅ Following proven patterns exactly
✅ Holistic comparison when stuck

### What Doesn't Work
❌ TypeScript config files
❌ ES Module config files
❌ Docker with build args
❌ Hardcoded secrets
❌ Skipping local testing
❌ Repeating failed deployments
❌ Assuming newer patterns work

### Time Saved
- **Following this guide**: 30-60 minutes to working deployment
- **Not following this guide**: 4-6 hours of debugging (LineaBlu experience)

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

**Key Takeaway**: Use JavaScript CommonJS for config files, buildpacks for deployment, and Secret Manager for secrets. Test locally first. Reference Little Bo Peep when stuck. Simple patterns work best.

**Last Updated**: January 14, 2026
**Based On**: Little Bo Peep (working) + LineaBlu (lessons learned)
**Maintained By**: Chris Savides
