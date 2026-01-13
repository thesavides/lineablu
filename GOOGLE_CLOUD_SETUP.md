# Google Cloud CLI Setup & Deployment Triggers

## Prerequisites

- Google Cloud account with billing enabled
- Project ID: `lineablu`
- Admin access to the project

---

## Part 1: Google Cloud CLI Setup

### Step 1: Verify gcloud CLI Installation

```bash
# Check if gcloud is installed
gcloud --version

# If not installed, install it:
# macOS
brew install --cask google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

### Step 2: Authenticate with Google Cloud

```bash
# Login to your Google account
gcloud auth login
```

This will:
1. Open a browser window
2. Ask you to sign in with your Google account
3. Grant permissions to gcloud CLI
4. Return to terminal once complete

### Step 3: Set Your Project

```bash
# Set the active project
gcloud config set project lineablu

# Verify the project is set
gcloud config list
```

Expected output:
```
[core]
account = your-email@example.com
project = lineablu
```

### Step 4: Enable Required Google Cloud APIs

```bash
# Enable Cloud Build API (for building Docker images)
gcloud services enable cloudbuild.googleapis.com

# Enable Cloud Run API (for deploying containers)
gcloud services enable run.googleapis.com

# Enable Container Registry API (for storing Docker images)
gcloud services enable containerregistry.googleapis.com

# Enable Artifact Registry API (newer registry)
gcloud services enable artifactregistry.googleapis.com

# Verify enabled services
gcloud services list --enabled | grep -E 'cloudbuild|run|container|artifact'
```

### Step 5: Configure Docker Authentication

```bash
# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker

# For Artifact Registry (if using it)
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### Step 6: Set Up Application Default Credentials

```bash
# Set up application default credentials (for local development)
gcloud auth application-default login
```

This allows your local application to authenticate with Google Cloud services.

### Step 7: Verify Your Access

```bash
# List your projects
gcloud projects list

# Check your permissions
gcloud projects get-iam-policy lineablu --flatten="bindings[].members" --filter="bindings.members:user:$(gcloud config get-value account)"
```

---

## Part 2: GitHub Integration & Deployment Triggers

### Option A: GitHub Actions (Recommended)

This sets up automated deployments whenever you push to GitHub.

#### Step 1: Create a Service Account for GitHub Actions

```bash
# Create a service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment" \
  --description="Service account for automated deployments from GitHub Actions"

# Get your project number
PROJECT_NUMBER=$(gcloud projects describe lineablu --format="value(projectNumber)")
echo "Project Number: $PROJECT_NUMBER"
```

#### Step 2: Grant Necessary Permissions

```bash
# Cloud Run Admin (to deploy services)
gcloud projects add-iam-policy-binding lineablu \
  --member="serviceAccount:github-actions@lineablu.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Cloud Build Editor (to create builds)
gcloud projects add-iam-policy-binding lineablu \
  --member="serviceAccount:github-actions@lineablu.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

# Service Account User (to deploy as service account)
gcloud projects add-iam-policy-binding lineablu \
  --member="serviceAccount:github-actions@lineablu.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Storage Admin (to push Docker images)
gcloud projects add-iam-policy-binding lineablu \
  --member="serviceAccount:github-actions@lineablu.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Artifact Registry Writer (for pushing images)
gcloud projects add-iam-policy-binding lineablu \
  --member="serviceAccount:github-actions@lineablu.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Viewer (to read project resources)
gcloud projects add-iam-policy-binding lineablu \
  --member="serviceAccount:github-actions@lineablu.iam.gserviceaccount.com" \
  --role="roles/viewer"
```

#### Step 3: Create and Download Service Account Key

```bash
# Create a key file
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=github-actions@lineablu.iam.gserviceaccount.com

# Display the key (you'll need to copy this)
cat ~/github-actions-key.json

# IMPORTANT: Copy the entire JSON content
# You'll paste this into GitHub secrets
```

⚠️ **SECURITY WARNING**:
- This key grants full access to your project
- Keep it secret and never commit it to Git
- Delete the local file after adding to GitHub: `rm ~/github-actions-key.json`

#### Step 4: Set Up GitHub Repository

```bash
# Create a new repository on GitHub (if not exists)
# Go to: https://github.com/new
# Name: legal-impact-score
# Make it private (recommended)

# Initialize Git and push (if not already done)
cd /Users/chrissavides/Documents/Lineablu/lineablu-app

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/legal-impact-score.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 5: Add GitHub Secrets

Go to your GitHub repository:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `GCP_SA_KEY` | Contents of `github-actions-key.json` | Service account credentials |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://bucygeoagmovtqptdpsa.supabase.co` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Supabase admin key |
| `SENDGRID_API_KEY` | Your SendGrid key | Email service key (optional) |

**To add a secret:**
1. Click "New repository secret"
2. Enter the name (e.g., `GCP_SA_KEY`)
3. Paste the value
4. Click "Add secret"
5. Repeat for all secrets

#### Step 6: Verify GitHub Actions Workflow

The workflow is already created at `.github/workflows/deploy.yml`. It will:
1. Run on every push to `main` branch
2. Install dependencies
3. Run linter
4. Build the application
5. Deploy to Google Cloud Run
6. Update environment variables

Test it:
```bash
# Make a small change
echo "# Test deployment" >> README.md

# Commit and push
git add README.md
git commit -m "test: Trigger deployment"
git push origin main
```

Go to your repository → **Actions** tab to watch the deployment.

---

### Option B: Google Cloud Build Triggers (Alternative)

This sets up deployment directly in Google Cloud when you push to GitHub.

#### Step 1: Connect GitHub Repository

```bash
# Install the GitHub app for Cloud Build
# Go to: https://console.cloud.google.com/cloud-build/triggers
# Click "Connect Repository"
# Follow the prompts to authorize GitHub
```

Or use the command line:
```bash
# Create a connection (requires GitHub personal access token)
gcloud alpha builds connections create github lineablu-github \
  --region=us-central1
```

#### Step 2: Create Build Trigger

Via Console (Recommended):
1. Go to https://console.cloud.google.com/cloud-build/triggers
2. Click **Create Trigger**
3. Configure:
   - **Name**: `lineablu-legal-impact-score-deploy`
   - **Event**: Push to a branch
   - **Source**: Select your GitHub repository
   - **Branch**: `^main$`
   - **Configuration**: Cloud Build configuration file
   - **Location**: `cloudbuild.yaml`
4. Click **Create**

Or via CLI:
```bash
gcloud builds triggers create github \
  --name="lineablu-legal-impact-score-deploy" \
  --repo-name="legal-impact-score" \
  --repo-owner="YOUR_GITHUB_USERNAME" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --region=us-central1
```

#### Step 3: Test the Trigger

```bash
# Make a change and push
echo "# Test Cloud Build" >> README.md
git add README.md
git commit -m "test: Trigger Cloud Build"
git push origin main

# View build history
gcloud builds list --limit=5
```

---

## Part 3: Manual Deployment (Testing)

Before setting up automated deployments, test manual deployment:

### Step 1: Build Locally

```bash
cd /Users/chrissavides/Documents/Lineablu/lineablu-app

# Test build
npm run build

# Verify it works
npm start
```

Visit http://localhost:3000 to test.

### Step 2: Deploy to Cloud Run

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml

# This will:
# 1. Build Docker image
# 2. Push to Container Registry
# 3. Deploy to Cloud Run
```

### Step 3: Set Environment Variables

After first deployment, set environment variables:

```bash
gcloud run services update lineablu-legal-impact-score \
  --region=us-central1 \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=https://bucygeoagmovtqptdpsa.supabase.co" \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Y3lnZW9hZ21vdnRxcHRkcHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTMwNzksImV4cCI6MjA4Mzg4OTA3OX0.uRLBmLKRrS7rdjbMJBYdDjfb9HnbKrOYn3TiMVbqBlo" \
  --set-env-vars="SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Y3lnZW9hZ21vdnRxcHRkcHNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzA3OSwiZXhwIjoyMDgzODg5MDc5fQ.b4aLP8ExDBFU867buxuWaZLr-5Ak78ZBO6G0--MFphg" \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="EMAIL_FROM=info@lineablu.com" \
  --set-env-vars="EMAIL_TO_ADMIN=siphokazi@lineablu.com"
```

### Step 4: Get Service URL

```bash
# Get the URL of your deployed service
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1 \
  --format='value(status.url)'
```

Visit the URL to test your deployed application!

---

## Part 4: Verification & Testing

### Test the Deployment Pipeline

1. **Make a change**
```bash
# Edit any file
echo "<!-- Test -->" >> app/page.tsx

# Commit and push
git add .
git commit -m "test: Verify deployment pipeline"
git push origin main
```

2. **Watch the build** (if using GitHub Actions)
```bash
# Go to: https://github.com/YOUR_USERNAME/legal-impact-score/actions
```

3. **Check Cloud Build** (if using Cloud Build triggers)
```bash
gcloud builds list --limit=5

# View logs of latest build
gcloud builds log $(gcloud builds list --limit=1 --format='value(id)')
```

4. **Verify deployment**
```bash
# Check service status
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1

# View recent logs
gcloud run services logs read lineablu-legal-impact-score \
  --region=us-central1 \
  --limit=50
```

---

## Part 5: Monitoring & Management

### View Logs

```bash
# Stream logs in real-time
gcloud run services logs tail lineablu-legal-impact-score \
  --region=us-central1

# View recent logs
gcloud run services logs read lineablu-legal-impact-score \
  --region=us-central1 \
  --limit=100

# Filter by severity
gcloud run services logs read lineablu-legal-impact-score \
  --region=us-central1 \
  --log-filter="severity>=ERROR"
```

### View Service Details

```bash
# Get service info
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1

# List all revisions
gcloud run revisions list \
  --service=lineablu-legal-impact-score \
  --region=us-central1

# View metrics
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1 \
  --format="table(metadata.name,status.url,status.latestCreatedRevisionName)"
```

### Update Configuration

```bash
# Update environment variable
gcloud run services update lineablu-legal-impact-score \
  --region=us-central1 \
  --set-env-vars="NEW_VAR=value"

# Update memory/CPU
gcloud run services update lineablu-legal-impact-score \
  --region=us-central1 \
  --memory=512Mi \
  --cpu=1

# Update scaling
gcloud run services update lineablu-legal-impact-score \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=10
```

---

## Part 6: Troubleshooting

### Common Issues

**Issue: Permission Denied**
```bash
# Check your permissions
gcloud projects get-iam-policy lineablu \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:$(gcloud config get-value account)"

# You need at least these roles:
# - roles/run.admin
# - roles/cloudbuild.builds.editor
```

**Issue: Build Fails**
```bash
# View build logs
gcloud builds log $(gcloud builds list --limit=1 --format='value(id)')

# Common fixes:
# 1. Check cloudbuild.yaml syntax
# 2. Verify Dockerfile
# 3. Check for package.json errors
```

**Issue: Service Not Starting**
```bash
# Check logs for errors
gcloud run services logs read lineablu-legal-impact-score \
  --region=us-central1 \
  --limit=100

# Common fixes:
# 1. Check environment variables
# 2. Verify port 3000 is exposed
# 3. Check for startup errors
```

**Issue: GitHub Actions Failing**
- Go to Actions tab in GitHub
- Click on failed workflow
- Review logs
- Check that all secrets are set correctly

---

## Part 7: Security Best Practices

### 1. Rotate Service Account Keys Regularly

```bash
# List keys
gcloud iam service-accounts keys list \
  --iam-account=github-actions@lineablu.iam.gserviceaccount.com

# Delete old key
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=github-actions@lineablu.iam.gserviceaccount.com

# Create new key
gcloud iam service-accounts keys create new-key.json \
  --iam-account=github-actions@lineablu.iam.gserviceaccount.com

# Update GitHub secret with new key
```

### 2. Use Secret Manager for Sensitive Data

```bash
# Enable Secret Manager
gcloud services enable secretmanager.googleapis.com

# Create a secret
echo -n "your-secret-value" | gcloud secrets create sendgrid-api-key \
  --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding sendgrid-api-key \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Enable VPC Connector (Optional, for database security)

```bash
# Create VPC connector
gcloud compute networks vpc-access connectors create lineablu-connector \
  --region=us-central1 \
  --range=10.8.0.0/28

# Update Cloud Run to use connector
gcloud run services update lineablu-legal-impact-score \
  --region=us-central1 \
  --vpc-connector=lineablu-connector
```

---

## Quick Reference Commands

```bash
# Deploy manually
gcloud builds submit --config cloudbuild.yaml

# View service URL
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1 \
  --format='value(status.url)'

# Stream logs
gcloud run services logs tail lineablu-legal-impact-score --region=us-central1

# Update env vars
gcloud run services update lineablu-legal-impact-score \
  --region=us-central1 \
  --set-env-vars="KEY=value"

# Rollback
gcloud run services update-traffic lineablu-legal-impact-score \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1
```

---

## Summary

You now have:
- ✅ Google Cloud CLI configured and authenticated
- ✅ Required APIs enabled
- ✅ Service account created with proper permissions
- ✅ GitHub Actions or Cloud Build triggers configured
- ✅ Automated deployment pipeline
- ✅ Monitoring and logging set up

**Next Steps:**
1. Test local build: `npm run build`
2. Push to GitHub: Triggers automatic deployment
3. Monitor: Check GitHub Actions or Cloud Build
4. Verify: Visit the deployed URL

For issues, check the Troubleshooting section or logs.
