#!/bin/bash

# LineaBlu Legal Impact Score - Google Cloud Deployment Script

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment to Google Cloud...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}gcloud CLI not found. Please install it first.${NC}"
    exit 1
fi

# Get project ID
PROJECT_ID="lineablu"
echo -e "${YELLOW}Using project: ${PROJECT_ID}${NC}"

# Set the project
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${GREEN}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and push
echo -e "${GREEN}Building and pushing container...${NC}"
gcloud builds submit --config cloudbuild.yaml

# Get service URL
SERVICE_URL=$(gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1 \
  --format='value(status.url)' 2>/dev/null || echo "")

if [ -z "$SERVICE_URL" ]; then
    echo -e "${YELLOW}Service not yet deployed. Run the following command to set environment variables:${NC}"
    echo ""
    echo "gcloud run services update lineablu-legal-impact-score \\"
    echo "  --region=us-central1 \\"
    echo "  --set-env-vars=\"NEXT_PUBLIC_SUPABASE_URL=https://bucygeoagmovtqptdpsa.supabase.co\" \\"
    echo "  --set-env-vars=\"NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>\" \\"
    echo "  --set-env-vars=\"SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>\""
else
    echo -e "${GREEN}Deployment successful!${NC}"
    echo -e "${YELLOW}Service URL: ${SERVICE_URL}${NC}"
fi

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Set environment variables using the gcloud command above"
echo "2. Test the deployment at the service URL"
echo "3. Configure custom domain if needed"
