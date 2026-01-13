#!/bin/bash

# Load secrets from Google Cloud Secret Manager
# This script pulls all environment variables from GC secrets and creates .env.local

set -e

echo "Loading secrets from Google Cloud Secret Manager..."

# Create or clear .env.local
cat > .env.local << 'EOF'
# This file is auto-generated from Google Cloud Secret Manager
# DO NOT EDIT MANUALLY - Run ./scripts/load-secrets.sh to regenerate
# Generated at: $(date)

EOF

# Function to get secret value
get_secret() {
  local secret_name=$1
  gcloud secrets versions access latest --secret="$secret_name" 2>/dev/null || echo ""
}

# Supabase secrets (required)
echo "# Supabase" >> .env.local
SUPABASE_URL=$(get_secret "NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_ANON=$(get_secret "NEXT_PUBLIC_SUPABASE_ANON_KEY")
SUPABASE_SERVICE=$(get_secret "SUPABASE_SERVICE_ROLE_KEY")

if [ -n "$SUPABASE_URL" ]; then
  echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL" >> .env.local
fi
if [ -n "$SUPABASE_ANON" ]; then
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON" >> .env.local
fi
if [ -n "$SUPABASE_SERVICE" ]; then
  echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE" >> .env.local
fi

# Email secrets (optional)
echo "" >> .env.local
echo "# Email" >> .env.local
SENDGRID_KEY=$(get_secret "SENDGRID_API_KEY")
if [ -n "$SENDGRID_KEY" ]; then
  echo "SENDGRID_API_KEY=$SENDGRID_KEY" >> .env.local
else
  echo "# SENDGRID_API_KEY= (not set in GC Secret Manager)" >> .env.local
fi

EMAIL_FROM=$(get_secret "EMAIL_FROM")
if [ -n "$EMAIL_FROM" ]; then
  echo "EMAIL_FROM=$EMAIL_FROM" >> .env.local
else
  echo "EMAIL_FROM=info@lineablu.com" >> .env.local
fi

EMAIL_TO_ADMIN=$(get_secret "EMAIL_TO_ADMIN")
if [ -n "$EMAIL_TO_ADMIN" ]; then
  echo "EMAIL_TO_ADMIN=$EMAIL_TO_ADMIN" >> .env.local
else
  echo "EMAIL_TO_ADMIN=siphokazi@lineablu.com" >> .env.local
fi

# Calendly secrets (optional)
echo "" >> .env.local
echo "# Calendly" >> .env.local
CALENDLY_KEY=$(get_secret "CALENDLY_API_KEY")
if [ -n "$CALENDLY_KEY" ]; then
  echo "CALENDLY_API_KEY=$CALENDLY_KEY" >> .env.local
else
  echo "# CALENDLY_API_KEY= (not set in GC Secret Manager)" >> .env.local
fi

CALENDLY_URL=$(get_secret "CALENDLY_BOOKING_URL")
if [ -n "$CALENDLY_URL" ]; then
  echo "CALENDLY_BOOKING_URL=$CALENDLY_URL" >> .env.local
else
  echo "CALENDLY_BOOKING_URL=https://calendly.com/lineablu/legal-impact-consultation" >> .env.local
fi

# Analytics secrets (optional)
echo "" >> .env.local
echo "# Analytics" >> .env.local
GA_ID=$(get_secret "NEXT_PUBLIC_GA_MEASUREMENT_ID")
if [ -n "$GA_ID" ]; then
  echo "NEXT_PUBLIC_GA_MEASUREMENT_ID=$GA_ID" >> .env.local
else
  echo "# NEXT_PUBLIC_GA_MEASUREMENT_ID= (not set in GC Secret Manager)" >> .env.local
fi

MIXPANEL_TOKEN=$(get_secret "NEXT_PUBLIC_MIXPANEL_TOKEN")
if [ -n "$MIXPANEL_TOKEN" ]; then
  echo "NEXT_PUBLIC_MIXPANEL_TOKEN=$MIXPANEL_TOKEN" >> .env.local
else
  echo "# NEXT_PUBLIC_MIXPANEL_TOKEN= (not set in GC Secret Manager)" >> .env.local
fi

# Static configuration (not secrets)
cat >> .env.local << 'EOF'

# Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# PDF Generation
PDF_GENERATION_ENABLED=true

# Feature Flags
NEXT_PUBLIC_ENABLE_EMAIL_GATE=false
NEXT_PUBLIC_ENABLE_RETARGETING=true
EOF

echo "✅ Successfully loaded secrets from Google Cloud"
echo "📄 Created .env.local"
echo ""
echo "Loaded secrets:"
grep -v "^#" .env.local | grep "=" | grep -v "not set" | cut -d'=' -f1 | sed 's/^/  ✓ /'
echo ""
echo "Missing secrets (set with: gcloud secrets create SECRET_NAME --data-file=-):"
grep "not set" .env.local | grep -o '[A-Z_]*' | sed 's/^/  ✗ /'
