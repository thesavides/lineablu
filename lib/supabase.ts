import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  }
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return key;
}

// Client-side Supabase client (uses anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Server-side Supabase client (uses service role key for admin operations)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Helper function to save assessment
export async function saveAssessment(assessmentData: any) {
  const { data, error } = await supabase
    .from('assessments')
    .insert([assessmentData])
    .select()
    .single();

  if (error) {
    console.error('Error saving assessment:', error);
    throw error;
  }

  return data;
}

// Helper function to update assessment
export async function updateAssessment(id: string, updates: any) {
  const { data, error } = await supabase
    .from('assessments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating assessment:', error);
    throw error;
  }

  return data;
}

// Helper function to track analytics event
export async function trackEvent(eventData: any) {
  const { error } = await supabase
    .from('analytics_events')
    .insert([eventData]);

  if (error) {
    console.error('Error tracking event:', error);
  }
}

// Helper function to get assessment by ID
export async function getAssessment(id: string) {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching assessment:', error);
    throw error;
  }

  return data;
}

// Helper function to schedule email
export async function scheduleEmail(assessmentId: string, emailNumber: number, emailType: string) {
  const { error } = await supabase
    .from('email_sequences')
    .insert([{
      assessment_id: assessmentId,
      email_number: emailNumber,
      email_type: emailType,
      status: 'pending'
    }]);

  if (error) {
    console.error('Error scheduling email:', error);
  }
}
