# LineaBlu Legal Value Score - Deployment Handoff
**Date**: January 14, 2026
**Session**: Complete Reframing + Persona Implementation
**Status**: ✅ DEPLOYED & LIVE
**URL**: https://lineablu-legal-impact-score-816746455484.us-central1.run.app

---

## 🎯 WHAT WAS ACCOMPLISHED

### Phase 1: Deployment Fixes (Option 2)

**Problem**: App was failing to deploy to Cloud Run due to Docker/buildpack configuration issues.

**Root Cause Identified**:
1. Dockerfile was still present and being used instead of buildpacks
2. `cloudbuild.yaml` was configured for Docker builds
3. Invalid `project.toml` with bad buildpack definitions
4. Supabase client initialization failing during build-time

**Solutions Applied**:
1. ✅ Removed Dockerfile completely
2. ✅ Updated `cloudbuild.yaml` to use `--source=.` with buildpacks only
3. ✅ Removed invalid `project.toml` file
4. ✅ Fixed Supabase client with placeholder credentials for build-time:
   - Real credentials injected at runtime via Secret Manager
   - Placeholder values satisfy Supabase client validation during build

### Phase 2: Complete Reframing (REFRAMING_BRIEF.md Phase 1 Critical)

**Transformed from Risk-Based to Opportunity-Based Assessment**:

**Questions & Scoring**:
- ✅ Updated all 8 questions with opportunity-focused language
- ✅ Changed category names:
  - `contract/risk/efficiency/strategic` → `contract_opportunity/growth_enablement/cost_opportunity/strategic_value`
- ✅ Added value potential calculations showing €X amounts
- ✅ Updated tier names:
  - "At Risk" → "Significant Opportunity"
  - "Exposed" → "Transformational Potential"
  - "Capable with Gaps" → "Strong Foundation, Growth Ready"
  - "Optimized" → "Maximized Value"

**UI/UX Updates**:
- ✅ Rebranded everywhere: "Legal Impact Score™" → "Legal Value Score™"
- ✅ Welcome screen: value discovery messaging instead of fear-based
- ✅ Results screen: **PROMINENT € value display** (e.g., "€475K Annual Value Potential")
- ✅ Updated homepage copy and metadata
- ✅ Removed ALL fear/risk language
- ✅ Added value breakdown by category with € amounts

### Phase 3: Persona Selection (Campaign Strategy Implementation)

**Added 4 Persona Types** (per campaign-summary.md):

1. **Chief Financial Officer** (30% budget allocation)
   - Icon: 💰
   - Pain Point: Hidden contract costs, budget surprises, uncontrolled outside counsel spend
   - Message: "Find out what's costing you before it hits the P&L"

2. **General Counsel** (35% budget allocation)
   - Icon: ⚖️
   - Pain Point: Overload, capacity constraints, stakeholder frustration
   - Message: "Stop drowning in tactical work"

3. **CEO / Founder** (25% budget allocation)
   - Icon: 🚀
   - Pain Point: Legal bottlenecks, expansion uncertainty, deal delays
   - Message: "Scale without legal surprises"

4. **Operations Leader** (10% budget allocation)
   - Icon: ⚙️
   - Pain Point: Deal velocity, legal friction, process inefficiency
   - Message: "Make legal a speed advantage, not a speed bump"

**Features**:
- Persona selection screen after welcome
- Visual cards showing pain points and messaging
- Persona tracked and saved with each assessment
- Skip option for general users
- Personas enable persona-targeted LinkedIn campaign tracking

---

## 🏗️ TECHNICAL ARCHITECTURE

### Deployment Configuration

**Platform**: Google Cloud Run
**Region**: us-central1
**Build Method**: Cloud Buildpacks (NO Docker)
**Project ID**: inner-chassis-484215-i8
**Service Name**: lineablu-legal-impact-score

### Key Files

**cloudbuild.yaml**:
```yaml
steps:
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'lineablu-legal-impact-score'
      - '--source=.'                    # Buildpacks auto-detect
      - '--region=us-central1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--project=$PROJECT_ID'
      - '--clear-env-vars'
      - '--update-secrets=NEXT_PUBLIC_SUPABASE_URL=NEXT_PUBLIC_SUPABASE_URL:latest,NEXT_PUBLIC_SUPABASE_ANON_KEY=NEXT_PUBLIC_SUPABASE_ANON_KEY:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest'

options:
  logging: CLOUD_LOGGING_ONLY

timeout: '1200s'
```

**lib/supabase.ts** (Critical Pattern):
```typescript
// Match Little Bo Peep pattern - use placeholder values for build-time
// Real values injected at runtime via environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjQ1MTkyODAwLCJleHAiOjE5NjA3Njg4MDB9.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Why This Works**:
- Next.js build process tries to execute route handlers to collect page data
- Route handlers import Supabase client
- Supabase client creation requires valid URL/key format
- Empty strings fail validation
- Placeholder values satisfy validation
- Real credentials injected at runtime by Cloud Run

### Config Files (CRITICAL for Buildpacks)

**ALL config files MUST be JavaScript CommonJS** (not TypeScript or ES Modules):
- ✅ `next.config.js` (NOT .ts)
- ✅ `postcss.config.js` (NOT .mjs)
- ✅ `tailwind.config.js` (NOT .ts)

**App code CAN be TypeScript** - just not config files.

### Environment Variables

**Stored in Google Cloud Secret Manager**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Injected at runtime** via `--update-secrets` flag in cloudbuild.yaml

### IAM Permissions

**Cloud Build Service Account**: `816746455484@cloudbuild.gserviceaccount.com`

Required roles:
- ✅ `roles/cloudbuild.builds.builder`
- ✅ `roles/artifactregistry.writer`
- ✅ `roles/storage.admin`
- ✅ `roles/run.developer`
- ✅ Secret access to all 3 Supabase secrets

---

## 📊 DATA MODEL

### Assessment Submission

**Fields sent to API** (`/api/assessment/submit`):
```typescript
{
  persona: 'cfo' | 'general-counsel' | 'ceo' | 'operations' | 'general',
  answers: { q1: {...}, q2: {...}, ... },
  email: string,
  firstName: string,
  lastName: string,
  companyName: string,

  // Scoring (normalized to 0-100)
  total_score: number,

  // Category scores (0-25 each, new opportunity-based names)
  contract_score: number,           // contract_opportunity
  risk_score: number,               // growth_enablement (reused field)
  efficiency_score: number,         // cost_opportunity (reused field)
  strategic_score: number,          // strategic_value

  // Value potential (€ amounts)
  value_potential_total: number,
  value_potential_contract: number,
  value_potential_growth: number,
  value_potential_cost: number,
  value_potential_strategic: number,

  // Tier
  tier: 'maximized' | 'strong-foundation' | 'significant-opportunity' | 'transformational',

  // UTM tracking
  utm_source: string | null,
  utm_medium: string | null,
  utm_campaign: string | null,
  utm_content: string | null,

  // Metadata
  ip_address: string | null,
  user_agent: string | null,
  referrer: string | null
}
```

**Note on Database Schema**:
- Existing database columns (`contract_score`, `risk_score`, etc.) are reused
- New columns added for value potential tracking
- Database migration may be needed to add new value potential columns

---

## 🚀 DEPLOYMENT COMMANDS

### Build Locally
```bash
cd /Users/chrissavides/Documents/Lineablu/lineablu-app
npm run build
```

### Deploy to Cloud Run
```bash
gcloud run deploy lineablu-legal-impact-score \
  --source=. \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --project=inner-chassis-484215-i8 \
  --clear-env-vars \
  --update-secrets=NEXT_PUBLIC_SUPABASE_URL=NEXT_PUBLIC_SUPABASE_URL:latest,NEXT_PUBLIC_SUPABASE_ANON_KEY=NEXT_PUBLIC_SUPABASE_ANON_KEY:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest
```

### Check Build Status
```bash
gcloud builds list --limit=5
```

### Get Service URL
```bash
gcloud run services describe lineablu-legal-impact-score \
  --region=us-central1 \
  --format="value(status.url)"
```

### View Logs
```bash
gcloud run services logs read lineablu-legal-impact-score \
  --region=us-central1 \
  --limit=100
```

---

## ⚠️ CRITICAL LESSONS LEARNED

### Never Do This (Will Break Deployment)

❌ **Use Docker** - Buildpacks ONLY
❌ **Add Dockerfile** to the repository
❌ **Use TypeScript for config files** (next.config.ts)
❌ **Use ES Modules for config files** (.mjs)
❌ **Add project.toml** with manual buildpack definitions
❌ **Use empty strings for Supabase credentials** during build
❌ **Push without testing `npm run build` locally first**

### Always Do This (For Successful Deployment)

✅ **Use JavaScript CommonJS** for all config files
✅ **Test `npm run build` locally** before every push
✅ **Use placeholder credentials** for build-time (not empty strings)
✅ **Let buildpacks auto-detect** (no project.toml)
✅ **Store secrets in Secret Manager** with latest version
✅ **Use `--source=.` flag** in cloudbuild.yaml
✅ **Reference Little Bo Peep** (`/Users/chrissavides/Documents/littlebopeep-repo/`) as proven pattern

---

## 🔍 TROUBLESHOOTING GUIDE

### Build Fails with "No buildpack groups passed detection"

**Cause**: Invalid config file format or project.toml present

**Fix**:
1. Check all config files are `.js` (not `.ts` or `.mjs`)
2. Remove `project.toml` if present
3. Let buildpacks auto-detect

### Build Fails with "supabaseUrl is required" or "Missing env.NEXT_PUBLIC_SUPABASE_URL"

**Cause**: Supabase client initialization during build-time with empty strings

**Fix**:
```typescript
// Use placeholder values, not empty strings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGci...placeholder';
```

### Build Succeeds but App Fails at Runtime

**Cause**: Missing environment variables at runtime

**Fix**:
1. Check secrets exist in Secret Manager
2. Verify Cloud Build SA has secret access
3. Check `--update-secrets` flag in cloudbuild.yaml

### Going in Circles with Repeated Failures

**Fix**:
1. STOP deploying repeatedly
2. Compare ENTIRE setup with Little Bo Peep (`/Users/chrissavides/Documents/littlebopeep-repo/`)
3. Check: config files, package.json, directory structure
4. Fix root cause (usually config format), not symptoms

---

## 📁 FILE STRUCTURE

```
lineablu-app/
├── app/
│   ├── page.tsx                    # Homepage (opportunity-based copy)
│   ├── layout.tsx                  # Metadata (Legal Value Score™)
│   ├── assessment/
│   │   └── page.tsx                # Assessment page wrapper
│   └── api/
│       ├── assessment/
│       │   └── submit/route.ts     # Save assessment + value potential
│       └── email/
│           └── send/route.ts       # Email sending
│
├── components/
│   └── assessment/
│       └── AssessmentTool.tsx      # Main assessment flow with personas
│
├── lib/
│   └── supabase.ts                 # Supabase client (with placeholders)
│
├── utils/
│   └── scoring-algorithm.ts        # Questions, scoring, value calculations
│
├── next.config.js                  # ✅ JavaScript CommonJS
├── postcss.config.js               # ✅ JavaScript CommonJS
├── tailwind.config.js              # ✅ JavaScript CommonJS
├── cloudbuild.yaml                 # Buildpack deployment config
├── .env.local                      # Local env vars (not committed)
└── .gcloudignore                   # Ignore node_modules, .next, etc.
```

---

## 🎓 REFERENCE: LITTLE BO PEEP

**Location**: `/Users/chrissavides/Documents/littlebopeep-repo/`

**Why Reference It**:
- Proven Next.js + Supabase + Cloud Run deployment that works
- Same tech stack, successfully deployed multiple times
- Use as comparison when stuck

**Key Files to Compare**:
- `next.config.js`
- `postcss.config.js`
- `tailwind.config.js`
- `cloudbuild.yaml`
- `src/lib/supabase-client.ts`

**Critical Pattern from Little Bo Peep**:
```typescript
// Little Bo Peep uses hardcoded fallbacks (we use generic placeholders)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oyfikxdowpekmcxszbqg.supabase.co'
```

---

## 📋 NEXT STEPS / FUTURE WORK

### Phase 3: Email & PDF Reports (Not Yet Implemented)

**Missing from Original Technical Handoff**:
1. Email sending integration with SendGrid/similar
2. PDF report generation
3. Email sequence automation
4. Follow-up nurture campaigns

**Current State**:
- Email form collects contact info
- Assessment data saved to Supabase
- Email sending endpoint exists but may need implementation
- No PDF generation yet

### Database Schema Updates (May Be Needed)

**New columns to add**:
```sql
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS value_potential_total INTEGER;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS value_potential_contract INTEGER;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS value_potential_growth INTEGER;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS value_potential_cost INTEGER;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS value_potential_strategic INTEGER;
```

### Marketing Campaign Integration

**Persona tracking enables**:
- Persona-specific LinkedIn ads
- Targeted follow-up messaging
- ROI measurement per persona
- Budget allocation optimization (per campaign-summary.md)

---

## ✅ DEPLOYMENT CHECKLIST

Before each deployment:

- [ ] Test `npm run build` locally
- [ ] Verify all config files are `.js` format
- [ ] Check no Dockerfile in repository
- [ ] Check no project.toml in repository
- [ ] Verify Supabase client uses placeholders
- [ ] Commit changes to git
- [ ] Push to GitHub
- [ ] Deploy via `gcloud run deploy`
- [ ] Check deployment succeeds
- [ ] Test live URL
- [ ] Verify persona selection works
- [ ] Verify results show € values

---

## 🔗 USEFUL LINKS

- **Live App**: https://lineablu-legal-impact-score-816746455484.us-central1.run.app
- **Cloud Build Console**: https://console.cloud.google.com/cloud-build/builds?project=inner-chassis-484215-i8
- **Cloud Run Console**: https://console.cloud.google.com/run?project=inner-chassis-484215-i8
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager?project=inner-chassis-484215-i8
- **GitHub Repo**: https://github.com/thesavides/lineablu.git

---

## 📝 SESSION SUMMARY

**Started with**: Broken deployment, risk-based assessment, no personas
**Ended with**: Live deployment, opportunity-based assessment, full persona selection

**Key Achievements**:
1. ✅ Fixed deployment blockers (Docker → buildpacks)
2. ✅ Complete reframing per REFRAMING_BRIEF.md
3. ✅ Persona selection per campaign strategy
4. ✅ Value calculations showing € amounts
5. ✅ All copy updated to opportunity language

**Deployment Status**: ✅ STABLE AND LIVE

**Last Deployed**: January 14, 2026
**Revision**: lineablu-legal-impact-score-00005-jm2

---

**Remember**: When in doubt, reference Little Bo Peep. Test locally first. Use buildpacks, not Docker. Keep config files as JavaScript CommonJS.
