#!/bin/bash

# LineaBlu Legal Impact Score - Supabase Setup Script
# This script sets up the database schema in Supabase

set -e

echo "================================"
echo "Supabase Database Setup"
echo "================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    brew install supabase/tap/supabase
fi

echo "📋 To set up your database, please:"
echo ""
echo "1. Go to your Supabase project: https://app.supabase.com/project/bucygeoagmovtqptdpsa"
echo "2. Click on 'SQL Editor' in the left sidebar"
echo "3. Click 'New query'"
echo "4. Copy the contents of 'supabase/migrations/001_initial_schema.sql'"
echo "5. Paste it into the editor"
echo "6. Click 'Run' to execute the migration"
echo ""
echo "Alternatively, run the SQL directly:"
echo ""
cat supabase/migrations/001_initial_schema.sql
echo ""
echo "================================"
echo "✅ After running the migration, your database will be ready!"
echo "================================"
