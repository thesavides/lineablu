import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { getAssessment, updateAssessment } from '@/lib/supabase';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const { assessmentId } = await request.json();

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    // Get assessment data
    const assessment = await getAssessment(assessmentId);

    if (!assessment.email) {
      return NextResponse.json(
        { error: 'No email address provided' },
        { status: 400 }
      );
    }

    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid not configured, skipping email send');
      return NextResponse.json({ success: false, message: 'Email service not configured' });
    }

    // Prepare email content
    const msg = {
      to: assessment.email,
      from: process.env.EMAIL_FROM || 'info@lineablu.com',
      subject: `Your Legal Impact Score: ${assessment.total_score}/100`,
      html: generateEmailHTML(assessment),
    };

    // Send email
    await sgMail.send(msg);

    // Update assessment
    await updateAssessment(assessmentId, {
      email_sent: true,
      email_sent_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

function generateEmailHTML(assessment: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Your Legal Impact Score</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #2563eb, #4f46e5); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .score { font-size: 48px; font-weight: bold; margin: 20px 0; }
          .content { background: #f9fafb; padding: 30px; }
          .tier { display: inline-block; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 20px 0; }
          .breakdown { margin: 20px 0; }
          .category { margin: 15px 0; padding: 15px; background: white; border-radius: 8px; }
          .cta { background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Legal Impact Score</h1>
            <div class="score">${assessment.total_score}/100</div>
          </div>
          <div class="content">
            <div class="tier">${assessment.tier.toUpperCase()}</div>
            <h2>Score Breakdown</h2>
            <div class="breakdown">
              <div class="category">
                <strong>Contract Management:</strong> ${assessment.contract_score}/25
              </div>
              <div class="category">
                <strong>Risk & Compliance:</strong> ${assessment.risk_score}/25
              </div>
              <div class="category">
                <strong>Operational Efficiency:</strong> ${assessment.efficiency_score}/25
              </div>
              <div class="category">
                <strong>Strategic Alignment:</strong> ${assessment.strategic_score}/25
              </div>
            </div>
            <p>Thank you for completing the LineaBlu Legal Impact Score assessment.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/results/${assessment.id}" class="cta">View Detailed Report</a>
          </div>
        </div>
      </body>
    </html>
  `;
}
