-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Create assessments table
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- User information
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    job_title VARCHAR(150),

    -- Assessment data
    persona VARCHAR(50) NOT NULL,
    answers JSONB NOT NULL,

    -- Scores
    total_score INTEGER NOT NULL,
    contract_score INTEGER NOT NULL,
    risk_score INTEGER NOT NULL,
    efficiency_score INTEGER NOT NULL,
    strategic_score INTEGER NOT NULL,
    tier VARCHAR(20) NOT NULL,

    -- Tracking
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),

    -- Engagement
    call_booked BOOLEAN DEFAULT FALSE,
    call_booked_at TIMESTAMP WITH TIME ZONE,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    pdf_downloaded BOOLEAN DEFAULT FALSE,
    pdf_downloaded_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_assessments_created_at ON public.assessments(created_at DESC);
CREATE INDEX idx_assessments_email ON public.assessments(email);
CREATE INDEX idx_assessments_persona ON public.assessments(persona);
CREATE INDEX idx_assessments_tier ON public.assessments(tier);
CREATE INDEX idx_assessments_utm_campaign ON public.assessments(utm_campaign);

-- Create email_sequences table
CREATE TABLE public.email_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    assessment_id UUID REFERENCES public.assessments(id),
    email_number INTEGER NOT NULL,
    email_type VARCHAR(50) NOT NULL,

    sent_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,

    status VARCHAR(20) DEFAULT 'pending',

    UNIQUE(assessment_id, email_number)
);

-- Create analytics_events table
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    assessment_id UUID REFERENCES public.assessments(id),
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,

    session_id VARCHAR(100),
    page_url TEXT,

    CONSTRAINT fk_assessment
        FOREIGN KEY(assessment_id)
        REFERENCES public.assessments(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_assessment ON public.analytics_events(assessment_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON public.assessments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for the service)
CREATE POLICY "Enable insert for all users" ON public.assessments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for service role" ON public.assessments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for analytics events" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.assessments TO service_role;
GRANT ALL ON public.email_sequences TO service_role;
GRANT ALL ON public.analytics_events TO service_role;
GRANT INSERT ON public.assessments TO anon;
GRANT INSERT ON public.analytics_events TO anon;
