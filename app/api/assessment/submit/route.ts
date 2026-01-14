import { NextRequest, NextResponse } from 'next/server';
import { saveAssessment, scheduleEmail } from '@/lib/supabase';
import { calculateScores } from '@/utils/scoring-algorithm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      persona = 'general',
      answers,
      email,
      firstName,
      lastName,
      companyName,
      jobTitle,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent
    } = body;

    // Validate required fields
    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    // Calculate scores
    const scores = calculateScores(answers);

    // Prepare assessment data
    const assessmentData = {
      persona,
      answers,
      email: email || null,
      first_name: firstName || null,
      last_name: lastName || null,
      company_name: companyName || null,
      job_title: jobTitle || null,
      total_score: scores.total,
      contract_score: scores.breakdown.contract_opportunity,
      risk_score: scores.breakdown.growth_enablement,
      efficiency_score: scores.breakdown.cost_opportunity,
      strategic_score: scores.breakdown.strategic_value,
      tier: scores.tier,
      value_potential_total: scores.valuePotential.total,
      value_potential_contract: scores.valuePotential.contract,
      value_potential_growth: scores.valuePotential.growth,
      value_potential_cost: scores.valuePotential.cost,
      value_potential_strategic: scores.valuePotential.strategic,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      utm_content: utmContent || null,
      ip_address: request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
      referrer: request.headers.get('referer') || null
    };

    // Save to database
    const savedAssessment = await saveAssessment(assessmentData);

    // Schedule email sequence (if email provided)
    if (email) {
      await scheduleEmail(savedAssessment.id, 1, 'immediate_results');
    }

    return NextResponse.json({
      success: true,
      assessmentId: savedAssessment.id,
      scores: scores
    });

  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assessment' },
      { status: 500 }
    );
  }
}
