# Quick Database Setup - 2 Minutes! ⚡

Since you already have Supabase CLI access from Little Bo Peep, here's the fastest way to set up your LineaBlu database.

## Option 1: Copy-Paste SQL (Easiest - 2 minutes)

### Step 1: Open Supabase SQL Editor

Click this link (or copy-paste into browser):
```
https://app.supabase.com/project/bucygeoagmovtqptdpsa/sql
```

### Step 2: Create New Query

- Click the **"New query"** button (top right)

### Step 3: Copy the SQL

Open this file in your text editor:
```
/Users/chrissavides/Documents/Lineablu/lineablu-app/supabase/migrations/001_initial_schema.sql
```

Or run this command to display it:
```bash
cat /Users/chrissavides/Documents/Lineablu/lineablu-app/supabase/migrations/001_initial_schema.sql
```

**Select all the SQL** (Cmd+A) and **copy** (Cmd+C)

### Step 4: Paste and Run

- **Paste** into the Supabase SQL Editor (Cmd+V)
- Click **"Run"** button (or press Cmd+Enter)
- You should see: "Success. No rows returned"

### Step 5: Verify

- Click **"Table Editor"** in the left sidebar
- You should now see 3 tables:
  - ✅ assessments
  - ✅ email_sequences
  - ✅ analytics_events

**Done!** Your database is ready. 🎉

---

## Option 2: Use Supabase CLI (Alternative)

If you want to use the CLI like you did for Little Bo Peep:

### Step 1: Initialize Supabase in Project

```bash
cd /Users/chrissavides/Documents/Lineablu/lineablu-app

# Link to your project
supabase link --project-ref bucygeoagmovtqptdpsa
```

It will ask for your database password. This is different from your service role key.

**Don't have the database password?**
1. Go to: https://app.supabase.com/project/bucygeoagmovtqptdpsa/settings/database
2. Click "Reset database password"
3. Copy the new password
4. Use it in the link command

### Step 2: Apply Migration

```bash
# Push the migration to your database
supabase db push
```

This will apply the `001_initial_schema.sql` migration.

### Step 3: Verify

```bash
# Check if tables exist
supabase db diff
```

---

## Option 3: Quick Script (For automation fans)

I've created a script that will help you:

```bash
cd /Users/chrissavides/Documents/Lineablu/lineablu-app
node scripts/setup-database.js
```

This will check if tables exist and guide you through setup.

---

## Verification

After setup, verify everything works:

### 1. Check Tables in Supabase Dashboard

Go to: https://app.supabase.com/project/bucygeoagmovtqptdpsa/editor

You should see these tables:
- **assessments** - Stores assessment responses and scores
- **email_sequences** - Tracks email automation
- **analytics_events** - Captures user interactions

### 2. Test Locally

```bash
cd /Users/chrissavides/Documents/Lineablu/lineablu-app
npm run dev
```

Visit http://localhost:3000 and:
1. Click "Start Assessment"
2. Answer all 8 questions
3. Fill in the results form (name, email)
4. Click "Get My Full Report"

### 3. Check Data in Supabase

Go to: https://app.supabase.com/project/bucygeoagmovtqptdpsa/editor

- Click on **"assessments"** table
- You should see your test assessment!

---

## Troubleshooting

### Problem: SQL Editor says "permission denied"

**Solution:** Make sure you're logged into the correct Supabase account
- Go to: https://app.supabase.com
- Check the email in top right corner
- Should be the account that owns the bucygeoagmovtqptdpsa project

### Problem: Tables already exist

**Solution:** That's good! It means setup is already done. Proceed to testing.

### Problem: RLS policy errors

**Solution:** The migration includes RLS policies. If you get errors:
```sql
-- Run this in SQL Editor to check policies
SELECT * FROM pg_policies WHERE tablename IN ('assessments', 'email_sequences', 'analytics_events');
```

### Problem: Can't connect from local app

**Solution:** Check your .env.local file:
```bash
cat .env.local
```

Should contain:
```
NEXT_PUBLIC_SUPABASE_URL=https://bucygeoagmovtqptdpsa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## What the Migration Does

The SQL migration creates:

### Tables:
1. **assessments** - Main table for storing assessment data
   - User info (email, name, company)
   - Assessment responses (JSON)
   - Calculated scores
   - Tier classification
   - UTM tracking
   - Engagement tracking

2. **email_sequences** - Email automation tracking
   - Links to assessments
   - Email status (pending/sent/opened/clicked)
   - Scheduling information

3. **analytics_events** - Event tracking
   - User interactions
   - Page views
   - Session data

### Indexes:
- Speed up queries on common fields
- created_at, email, persona, tier, utm_campaign

### Row Level Security:
- INSERT allowed for anonymous users
- SELECT/UPDATE allowed for service role
- Protects data privacy

### Functions & Triggers:
- Auto-update timestamp trigger
- Updated_at automatically maintained

---

## Quick Reference

**Supabase Dashboard:** https://app.supabase.com/project/bucygeoagmovtqptdpsa

**SQL Editor:** https://app.supabase.com/project/bucygeoagmovtqptdpsa/sql

**Table Editor:** https://app.supabase.com/project/bucygeoagmovtqptdpsa/editor

**Migration File:** `/Users/chrissavides/Documents/Lineablu/lineablu-app/supabase/migrations/001_initial_schema.sql`

---

## Ready to Go!

**Recommended approach:** Option 1 (Copy-Paste SQL)
- Takes 2 minutes
- No CLI setup needed
- Works every time
- Visual confirmation

After setup, proceed to testing your application locally!
