#!/bin/bash

# LineaBlu - Create Secrets in Google Cloud Secret Manager
# Run this script in Google Cloud Shell

set -e

PROJECT_ID="lineablu"
REGION="us-central1"

echo "🔐 Creating secrets in Google Cloud Secret Manager"
echo "================================================"
echo "Project: $PROJECT_ID"
echo ""

# Set the project
gcloud config set project $PROJECT_ID

# Create supabase-url secret
echo "Creating supabase-url secret..."
echo -n "https://bucygeoagmovtqptdpsa.supabase.co" | \
  gcloud secrets create supabase-url \
    --data-file=- \
    --replication-policy="automatic" \
    2>&1 || echo "Secret supabase-url may already exist"

# Create supabase-anon-key secret
echo "Creating supabase-anon-key secret..."
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Y3lnZW9hZ21vdnRxcHRkcHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTMwNzksImV4cCI6MjA4Mzg4OTA3OX0.uRLBmLKRrS7rdjbMJBYdDjfb9HnbKrOYn3TiMVbqBlo" | \
  gcloud secrets create supabase-anon-key \
    --data-file=- \
    --replication-policy="automatic" \
    2>&1 || echo "Secret supabase-anon-key may already exist"

# Create supabase-service-key secret
echo "Creating supabase-service-key secret..."
echo -n "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1Y3lnZW9hZ21vdnRxcHRkcHNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxMzA3OSwiZXhwIjoyMDgzODg5MDc5fQ.b4aLP8ExDBFU867buxuWaZLr-5Ak78ZBO6G0--MFphg" | \
  gcloud secrets create supabase-service-key \
    --data-file=- \
    --replication-policy="automatic" \
    2>&1 || echo "Secret supabase-service-key may already exist"

echo ""
echo "✅ Verifying secrets..."
echo ""

gcloud secrets list --filter="name:supabase" --format="table(name,createTime)"

echo ""
echo "✅ Granting access to service account..."
echo ""

SERVICE_ACCOUNT="github-actions@inner-chassis-484215-i8.iam.gserviceaccount.com"

for SECRET in supabase-url supabase-anon-key supabase-service-key; do
  echo "Granting $SERVICE_ACCOUNT access to $SECRET..."
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    2>&1 || echo "Permission may already exist"
done

echo ""
echo "================================================"
echo "🎉 Secrets created successfully!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Verify GCP_SA_KEY is in GitHub secrets"
echo "2. Push to main branch to trigger deployment"
echo "3. Monitor deployment at: https://github.com/thesavides/lineablu/actions"
echo ""
