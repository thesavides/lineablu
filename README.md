# LineaBlu Legal Impact Score

A self-service assessment tool that generates qualified leads for LineaBlu's GCaaS (General Counsel as a Service) offering.

## Overview

The Legal Impact Score helps businesses assess their legal function's operational maturity and strategic impact through an 8-question assessment. The tool provides:

- Instant scoring across 4 key categories
- Personalized tier-based recommendations
- Email delivery of detailed reports
- Lead capture and analytics tracking

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Hosting**: Google Cloud Run
- **Email**: SendGrid
- **Analytics**: Google Analytics 4, Mixpanel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Google Cloud account
- SendGrid account (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lineablu/legal-impact-score.git
cd legal-impact-score
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- Supabase URL and keys
- SendGrid API key (optional)
- Analytics tokens (optional)

4. Set up the database:

Go to your Supabase project SQL editor and run the migration file:
```
supabase/migrations/001_initial_schema.sql
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
lineablu-app/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── assessment/        # Assessment page
│   └── page.tsx          # Landing page
├── components/            # React components
│   └── assessment/       # Assessment tool components
├── lib/                  # Library code
│   └── supabase.ts      # Supabase client
├── utils/               # Utility functions
│   └── scoring-algorithm.ts
├── supabase/           # Database migrations
└── public/            # Static assets
```

## Database Schema

The application uses three main tables:

1. **assessments**: Stores assessment responses and scores
2. **email_sequences**: Tracks email automation status
3. **analytics_events**: Captures user interaction events

See `supabase/migrations/001_initial_schema.sql` for full schema.

## Deployment

### Google Cloud Run

1. Build and deploy:
```bash
gcloud builds submit --config cloudbuild.yaml
```

2. Set environment variables in Cloud Run console

3. Configure custom domain (optional)

### Environment Variables

Required for production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:
- `SENDGRID_API_KEY`
- `EMAIL_FROM`
- `EMAIL_TO_ADMIN`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_MIXPANEL_TOKEN`

## Features

### Assessment Flow

1. Welcome screen with value proposition
2. 8 questions across 4 categories:
   - Contract Management
   - Risk & Compliance
   - Operational Efficiency
   - Strategic Alignment
3. Instant score calculation (0-100)
4. Tier-based results (Optimized/Capable/At-Risk/Exposed)
5. Email capture for detailed report

### Analytics

- Track assessment starts and completions
- Monitor conversion funnel
- UTM parameter tracking
- Session and event tracking

## Development

```bash
# Run development server
npm run dev

# Run type checking
npm run type-check

# Run linter
npm run lint

# Build for production
npm run build
```

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - LineaBlu LLC

## Support

For issues or questions:
- Email: siphokazi@lineablu.com
- Project: LineaBlu Legal Impact Score

## Changelog

### Version 1.0.0 (Initial Release)
- Assessment tool with 8 questions
- Score calculation and tier assignment
- Supabase database integration
- Email delivery (SendGrid)
- Google Cloud deployment configuration
- Basic analytics tracking
