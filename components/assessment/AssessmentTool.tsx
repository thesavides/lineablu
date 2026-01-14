'use client';

import React, { useState } from 'react';
import { ChevronRight, CheckCircle, TrendingUp } from 'lucide-react';
import { questions, calculateScores, getTierConfig, formatCurrency, type Scores } from '@/utils/scoring-algorithm';

interface Persona {
  id: string;
  title: string;
  icon: string;
  painPoint: string;
  message: string;
}

const personas: Persona[] = [
  {
    id: 'cfo',
    title: 'Chief Financial Officer',
    icon: '💰',
    painPoint: 'Hidden contract costs, budget surprises, uncontrolled outside counsel spend',
    message: 'Find out what\'s costing you before it hits the P&L'
  },
  {
    id: 'general-counsel',
    title: 'General Counsel',
    icon: '⚖️',
    painPoint: 'Overload, capacity constraints, stakeholder frustration',
    message: 'Stop drowning in tactical work'
  },
  {
    id: 'ceo',
    title: 'CEO / Founder',
    icon: '🚀',
    painPoint: 'Legal bottlenecks, expansion uncertainty, deal delays',
    message: 'Scale without legal surprises'
  },
  {
    id: 'operations',
    title: 'Operations Leader',
    icon: '⚙️',
    painPoint: 'Deal velocity, legal friction, process inefficiency',
    message: 'Make legal a speed advantage, not a speed bump'
  }
];

export default function AssessmentTool() {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [selectedPersona, setSelectedPersona] = useState<string>('');
  const [answers, setAnswers] = useState<any>({});
  const [scores, setScores] = useState<Scores | null>(null);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  const handleSubmitReport = async () => {
    if (!email || !firstName || !lastName) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          email,
          firstName,
          lastName,
          companyName,
          persona: selectedPersona || 'general',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAssessmentId(data.assessmentId);
        // Optionally send email
        await fetch('/api/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assessmentId: data.assessmentId,
          }),
        });
        alert('Thank you! Your report has been sent to your email.');
      } else {
        alert('Error submitting assessment. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = (questionId: string, option: any) => {
    const newAnswers = { ...answers, [questionId]: option };
    setAnswers(newAnswers);

    const questionKeys = Object.keys(questions);
    const currentIndex = questionKeys.indexOf(questionId);

    if (currentIndex < questionKeys.length - 1) {
      setCurrentStep(questionKeys[currentIndex + 1]);
    } else {
      const calculatedScores = calculateScores(newAnswers);
      setScores(calculatedScores);
      setCurrentStep('results');
    }
  };

  const ScoreGauge = ({ score, label }: { score: number; label: string }) => {
    const getColor = (score: number) => {
      if (score >= 20) return 'bg-green-500';
      if (score >= 15) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-bold text-gray-900">{score}/25</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getColor(score)}`}
            style={{ width: `${(score / 25) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  // Welcome Screen
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
              LineaBlu Legal Value Score™
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How much value is your legal function leaving on the table?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Most businesses are sitting on €200K-€500K in uncaptured legal value. Find out how much you could unlock in 5 minutes.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
            <p className="text-gray-700 text-lg font-medium">
              💰 Answer 8 questions. Discover your value potential. See exactly how much opportunity exists in your legal function.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span>Takes 3 minutes</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span>Instant personalized report</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span>Benchmarked against 100+ companies</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentStep('persona-selection')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors flex items-center justify-center group"
          >
            Start Assessment
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // Persona Selection Screen
  if (currentStep === 'persona-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Which best describes your role?
            </h2>
            <p className="text-lg text-gray-600">
              We'll tailor your assessment to focus on the opportunities most relevant to you
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {personas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => {
                  setSelectedPersona(persona.id);
                  setCurrentStep('q1');
                }}
                className="text-left p-6 rounded-xl border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-start mb-3">
                  <span className="text-4xl mr-3">{persona.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                      {persona.title}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Key Challenge:</strong> {persona.painPoint}
                </p>
                <p className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  {persona.message} →
                </p>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setSelectedPersona('general');
                setCurrentStep('q1');
              }}
              className="text-gray-600 hover:text-gray-900 underline text-sm"
            >
              Skip - I'll answer as a general user
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Question Screen
  if (currentStep in questions) {
    const question = questions[currentStep];
    const questionKeys = Object.keys(questions);
    const currentIndex = questionKeys.indexOf(currentStep);
    const progress = ((currentIndex + 1) / questionKeys.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">
                Question {currentIndex + 1} of {questionKeys.length}
              </span>
              <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            {question.text}
          </h2>

          <div className="space-y-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(currentStep, option)}
                className="w-full text-left p-6 rounded-lg border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-50 transition-all group"
              >
                <span className="text-lg text-gray-700 group-hover:text-gray-900">
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (currentStep === 'results' && scores) {
    const tierConfig = getTierConfig(scores.tier);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Legal Value Score
            </h2>

            {/* VALUE POTENTIAL - LARGE AND PROMINENT */}
            <div className="mb-6">
              <div className="inline-flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-8 mb-4">
                <div className="text-sm font-medium mb-2 opacity-90">Annual Value Potential</div>
                <div className="text-5xl md:text-6xl font-bold mb-2">{formatCurrency(scores.valuePotential.total)}</div>
                <div className="text-sm opacity-90">identified in untapped opportunities</div>
              </div>
            </div>

            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4">
              <span className="text-4xl font-bold">{scores.total}</span>
            </div>
            <div className={`inline-block px-6 py-2 rounded-full text-white font-semibold bg-${tierConfig.color}-600`}>
              {tierConfig.title}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-8">
            <p className="text-lg text-gray-700 font-medium">{tierConfig.message}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
              Value Opportunity Breakdown
            </h3>
            <div className="space-y-4">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">💎 Contract Value Opportunity</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(scores.valuePotential.contract)}</span>
                </div>
                <ScoreGauge score={scores.breakdown.contract_opportunity} label="" />
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">🚀 Growth Enablement Opportunity</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(scores.valuePotential.growth)}</span>
                </div>
                <ScoreGauge score={scores.breakdown.growth_enablement} label="" />
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">💰 Cost Optimization Opportunity</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(scores.valuePotential.cost)}</span>
                </div>
                <ScoreGauge score={scores.breakdown.cost_opportunity} label="" />
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900">📈 Strategic Value Opportunity</span>
                  <span className="text-2xl font-bold text-green-600">{formatCurrency(scores.valuePotential.strategic)}</span>
                </div>
                <ScoreGauge score={scores.breakdown.strategic_value} label="" />
              </div>
            </div>
          </div>

          <div className="border-t pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Get Your Detailed Report</h3>
            <p className="text-gray-600 mb-6">
              Enter your email to receive a comprehensive analysis of your results and personalized recommendations.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                onClick={handleSubmitReport}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Get My Full Report'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
