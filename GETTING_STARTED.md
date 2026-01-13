# Getting Started - LineaBlu Legal Impact Score

## 📋 Pre-Deployment Checklist

Follow these steps in order to get your application deployed:

### ✅ Step 1: Test Locally (5 minutes)

```bash
cd /Users/chrissavides/Documents/Lineablu/lineablu-app

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

**Open browser:** http://localhost:3000

**Test checklist:**
- [ ] Landing page loads
- [ ] Click "Start Assessment"
- [ ] Answer all 8 questions
- [ ] See your score and tier
- [ ] Fill in contact form
- [ ] No console errors

Press `Ctrl+C` to stop the server.

---

### ✅ Step 2: Set Up Supabase Database (10 minutes)

**Option A: Using Supabase Dashboard (Easiest)**

1. Go to https://app.supabase.com/project/bucygeoagmovtqptdpsa
2. Click **SQL Editor** in left sidebar
3. Click **New query**
4. Open `supabase/migrations/001_initial_schema.sql` in your text editor
5. Copy the entire contents
6. Paste into Supabase SQL Editor
7. Click **Run** (or press `Cmd+Enter`)
8. You should see "Success. No rows returned"

**Verify it worked:**
- Click **Table Editor** in left sidebar
- You should see tables: `assessments`, `email_sequences`, `analytics_events`

**Option B: Using the Script**
```bash
./scripts/setup-supabase.sh
```
Follow the on-screen instructions.

---

### ✅ Step 3: Set Up Google Cloud CLI (15 minutes)

**Follow the comprehensive guide:** `GOOGLE_CLOUD_SETUP.md`

**Quick version:**

```bash
# 1. Login to Google Cloud
gcloud auth login

# 2. Set your project
gcloud config set project lineablu

# 3. Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 4. Configure Docker
gcloud auth configure-docker
```

---

### ✅ Step 4: Manual Test Deployment (20 minutes)

Before setting up automation, do a manual deployment to verify everything works:

```bash
# Make sure you're in the project directory
cd /Users/chrissavides/Documents/Lineablu/lineablu-app

# Deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

**This will take 5-10 minutes**. You'll see output showing:
- Building Docker image
- Pushing to Container Registry
- Deploying to Cloud Run

**After deployment completes:**

```bash
# Set environment variables
gcloud run services update lineablu-legal-impact-score \
  --region=us-central1 \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=https://bucygeoagmovtqptdpsa.supabase.co" \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Y3lnZW9hZ21vdnRxcHRkcHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTMwNzksImV4cCI6MjA4Mzg4OTA3OX0.uRLBmLKRrS7rdjbMJBYdDjfb9HnbKrOYn3TiMVbqBlo" \
  --set-env-vars="SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Y3lnZW9hZ21vdnRxcHRkcHNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzA3OSwiZXhwIjoyMDgzODg5MDc5fQ.b4aLP8ExDBFU867buxuWaZLr-5Ak78ZBO6G0--MFphg" \
  --set-env-vars="NODE_ENV=production"

# Get your deployed URL
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1 \
  --format='value(status.url)'
```

**Test your deployed application:**
- Copy the URL from above
- Open in browser
- Complete a full assessment
- Check Supabase to verify data was saved

---

### ✅ Step 5: Set Up GitHub & Automated Deployments (30 minutes)

**See:** `GOOGLE_CLOUD_SETUP.md` - Part 2, Option A

**Summary:**

1. **Create service account:**
```bash
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployment"
```

2. **Grant permissions:**
```bash
# Run all the permission commands from GOOGLE_CLOUD_SETUP.md
```

3. **Create key:**
```bash
gcloud iam service-accounts keys create ~/github-actions-key.json \
  --iam-account=github-actions@lineablu.iam.gserviceaccount.com

cat ~/github-actions-key.json
```

4. **Create GitHub repo:**
   - Go to https://github.com/new
   - Name: `legal-impact-score`
   - Make it private
   - Don't initialize with README

5. **Push to GitHub:**
```bash
cd /Users/chrissavides/Documents/Lineablu/lineablu-app
git remote add origin https://github.com/YOUR_USERNAME/legal-impact-score.git
git push -u origin main
```

6. **Add GitHub Secrets:**
   - Go to repo Settings → Secrets and variables → Actions
   - Add these secrets:
     - `GCP_SA_KEY` = contents of github-actions-key.json
     - `NEXT_PUBLIC_SUPABASE_URL` = https://bucygeoagmovtqptdpsa.supabase.co
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
     - `SUPABASE_SERVICE_ROLE_KEY` = your service role key

7. **Test automated deployment:**
```bash
echo "# Test" >> README.md
git add README.md
git commit -m "test: Automated deployment"
git push origin main
```

Go to your repo → Actions tab → Watch the deployment!

---

## 🎯 Success Criteria

After completing all steps, you should have:

- ✅ Application running locally
- ✅ Supabase database set up with tables
- ✅ Application deployed to Cloud Run
- ✅ Able to complete assessment and see data in Supabase
- ✅ GitHub repo with automated deployments
- ✅ Every push to `main` triggers automatic deployment

---

## 📊 What Happens After Push to GitHub

When you push code to the `main` branch:

1. **GitHub Actions triggers** (automatic)
2. **Runs tests and linting** (~1 minute)
3. **Builds the application** (~2 minutes)
4. **Builds Docker image** (~3 minutes)
5. **Pushes to Container Registry** (~1 minute)
6. **Deploys to Cloud Run** (~2 minutes)
7. **Updates environment variables** (~30 seconds)
8. **Your app is live!** 🚀

**Total time:** ~10 minutes per deployment

---

## 🔍 Monitoring & Logs

### View Logs
```bash
# Stream logs in real-time
gcloud run services logs tail lineablu-legal-impact-score \
  --region=us-central1

# View recent logs
gcloud run services logs read lineablu-legal-impact-score \
  --region=us-central1 \
  --limit=50
```

### Check Service Status
```bash
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1
```

### View in Console
- **Cloud Run:** https://console.cloud.google.com/run?project=lineablu
- **Cloud Build:** https://console.cloud.google.com/cloud-build/builds?project=lineablu
- **Supabase:** https://app.supabase.com/project/bucygeoagmovtqptdpsa

---

## 🚨 Troubleshooting

### Local Development Issues

**Problem: `npm run dev` fails**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Problem: Build fails**
```bash
# Check for TypeScript errors
npm run build

# Fix any errors shown
```

### Deployment Issues

**Problem: gcloud not found**
```bash
# Install gcloud CLI
brew install --cask google-cloud-sdk
gcloud auth login
```

**Problem: Permission denied**
```bash
# Make sure you're logged in and project is set
gcloud auth login
gcloud config set project lineablu
```

**Problem: Build fails on Cloud Run**
```bash
# View build logs
gcloud builds list --limit=5
gcloud builds log <BUILD_ID>
```

**Problem: Service not starting**
```bash
# Check service logs
gcloud run services logs read lineablu-legal-impact-score \
  --region=us-central1 \
  --limit=100
```

### Database Issues

**Problem: Assessment not saving**
1. Check Supabase logs in dashboard
2. Verify tables exist
3. Check RLS policies are set correctly
4. Verify environment variables are set in Cloud Run

**Problem: Can't connect to Supabase**
- Verify URL and keys in `.env.local`
- Check if keys are set in Cloud Run environment variables
- Test connection from local machine first

---

## 📚 Additional Resources

- **GOOGLE_CLOUD_SETUP.md** - Detailed Google Cloud setup
- **DEPLOYMENT.md** - Comprehensive deployment guide
- **README.md** - Project overview
- **SETUP_COMPLETE.md** - Feature checklist

---

## ⚡ Quick Commands Reference

```bash
# Local Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Run production build

# Deployment
gcloud builds submit --config cloudbuild.yaml     # Manual deploy
./scripts/deploy-gcp.sh                           # Deploy with script

# Monitoring
gcloud run services logs tail lineablu-legal-impact-score --region=us-central1

# Get URL
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1 \
  --format='value(status.url)'
```

---

## 🎉 You're Ready!

Start with **Step 1** and work through each step. The entire setup should take about **1-2 hours**.

**Questions?** Check the troubleshooting section or review the detailed guides.

**Ready to deploy?** Start with testing locally, then follow the steps in order.

Good luck! 🚀
