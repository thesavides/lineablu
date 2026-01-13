# Deployment Guide

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Supabase Project** with database set up
3. **GitHub Account** for CI/CD
4. **SendGrid Account** (optional, for email functionality)

## Initial Setup

### 1. Set Up Supabase Database

Run the database migration in your Supabase project:

```bash
# Option 1: Using the Supabase SQL Editor
# 1. Go to https://app.supabase.com/project/bucygeoagmovtqptdpsa
# 2. Navigate to SQL Editor
# 3. Copy contents of supabase/migrations/001_initial_schema.sql
# 4. Paste and run

# Option 2: Using the setup script
./scripts/setup-supabase.sh
```

### 2. Local Testing

Before deploying, test the application locally:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Build production version
npm run build

# Test production build
npm start
```

Visit http://localhost:3000 and test the complete assessment flow.

### 3. Google Cloud Setup

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project
gcloud config set project lineablu

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 4. Initial Deployment

```bash
# Deploy using the deployment script
./scripts/deploy-gcp.sh

# Or manually
gcloud builds submit --config cloudbuild.yaml
```

### 5. Set Environment Variables

After initial deployment, set the environment variables:

```bash
gcloud run services update lineablu-legal-impact-score \
  --region=us-central1 \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_URL=https://bucygeoagmovtqptdpsa.supabase.co" \
  --set-env-vars="NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key" \
  --set-env-vars="SUPABASE_SERVICE_ROLE_KEY=your-service-role-key" \
  --set-env-vars="SENDGRID_API_KEY=your-sendgrid-key" \
  --set-env-vars="EMAIL_FROM=info@lineablu.com" \
  --set-env-vars="EMAIL_TO_ADMIN=siphokazi@lineablu.com"
```

## GitHub Actions CI/CD

### Setup

1. Create a GitHub repository:
```bash
git remote add origin https://github.com/lineablu/legal-impact-score.git
git push -u origin main
```

2. Add GitHub Secrets:
   - Go to your repository Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `GCP_SA_KEY`: Service account JSON key
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
     - `SENDGRID_API_KEY`: Your SendGrid API key (optional)

### Creating GCP Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Grant permissions
gcloud projects add-iam-policy-binding lineablu \
  --member="serviceAccount:github-actions@lineablu.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding lineablu \
  --member="serviceAccount:github-actions@lineablu.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding lineablu \
  --member="serviceAccount:github-actions@lineablu.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@lineablu.iam.gserviceaccount.com

# Copy the contents of key.json to GitHub secret GCP_SA_KEY
cat key.json
```

### Automated Deployment

Once set up, every push to `main` branch will:
1. Run tests and linting
2. Build the application
3. Deploy to Google Cloud Run
4. Update environment variables

## Manual Deployment

For manual deployments:

```bash
# Test locally first
npm run build
npm start

# Commit changes
git add .
git commit -m "Your commit message"
git push origin main

# Or deploy directly
./scripts/deploy-gcp.sh
```

## Verification

After deployment:

1. Check Cloud Run service status:
```bash
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1
```

2. Visit the service URL and test the assessment flow

3. Check Supabase dashboard to verify data is being saved

4. Test email delivery (if configured)

## Troubleshooting

### Build Fails

```bash
# Check build logs
gcloud builds list --limit=5
gcloud builds log <BUILD_ID>
```

### Service Not Starting

```bash
# Check service logs
gcloud run services logs read lineablu-legal-impact-score \
  --region=us-central1 \
  --limit=50
```

### Database Connection Issues

- Verify Supabase URL and keys in environment variables
- Check Row Level Security policies in Supabase
- Verify migration was run successfully

### Email Not Sending

- Verify SendGrid API key is set
- Check SendGrid dashboard for delivery status
- Review service logs for email errors

## Monitoring

### View Logs

```bash
# Stream logs
gcloud run services logs tail lineablu-legal-impact-score \
  --region=us-central1

# View recent logs
gcloud run services logs read lineablu-legal-impact-score \
  --region=us-central1 \
  --limit=100
```

### Metrics

View metrics in Google Cloud Console:
- https://console.cloud.google.com/run/detail/us-central1/lineablu-legal-impact-score/metrics

## Rollback

If you need to rollback to a previous version:

```bash
# List revisions
gcloud run revisions list \
  --service=lineablu-legal-impact-score \
  --region=us-central1

# Rollback to specific revision
gcloud run services update-traffic lineablu-legal-impact-score \
  --to-revisions=REVISION_NAME=100 \
  --region=us-central1
```

## Custom Domain

To add a custom domain:

```bash
gcloud run domain-mappings create \
  --service lineablu-legal-impact-score \
  --domain legal-impact-score.lineablu.com \
  --region us-central1
```

Then update DNS records as instructed.

## Cost Optimization

- Set minimum instances to 0 for development
- Set maximum instances to limit costs
- Monitor usage in Cloud Console billing

```bash
gcloud run services update lineablu-legal-impact-score \
  --region=us-central1 \
  --min-instances=0 \
  --max-instances=10
```

## Security

- Never commit `.env.local` or secrets to Git
- Rotate API keys regularly
- Use least privilege for service accounts
- Enable Cloud Armor for DDoS protection (optional)

## Support

For issues:
- Check logs first
- Review Supabase dashboard
- Contact: siphokazi@lineablu.com
