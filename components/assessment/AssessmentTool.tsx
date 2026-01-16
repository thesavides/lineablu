'use client';

import React, { useState } from 'react';
import { ChevronRight, CheckCircle, TrendingUp, Calendar, Download, Share2 } from 'lucide-react';
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
    painPoint: 'Unlock contract value, capture budget savings, optimize legal spend',
    message: 'Discover what value is waiting before next quarter'
  },
  {
    id: 'general-counsel',
    title: 'General Counsel',
    icon: '⚖️',
    painPoint: 'Scale legal capacity, elevate strategic impact, maximize team value',
    message: 'Transform from tactical execution to strategic driver'
  },
  {
    id: 'ceo',
    title: 'CEO / Founder',
    icon: '🚀',
    painPoint: 'Accelerate deal velocity, enable expansion, unlock growth potential',
    message: 'Make legal your competitive advantage'
  },
  {
    id: 'operations',
    title: 'Operations Leader',
    icon: '⚙️',
    painPoint: 'Speed up deals, optimize processes, drive efficiency gains',
    message: 'Turn legal into your velocity multiplier'
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

  // Check URL for persona parameter and skip directly to questions
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const personaParam = params.get('persona');
    if (personaParam) {
      setSelectedPersona(personaParam);
      setCurrentStep('q1'); // Skip welcome and persona selection, go straight to questions
    }
  }, []);

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
              How much value is waiting to be unlocked in your legal function?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Most businesses are sitting on hidden opportunities in their contracts, operations, and strategic positioning. Take our 5-minute assessment. Get your Growth Opportunity Score.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
            <p className="text-gray-700 text-lg font-medium">
              💎 Answer 8 questions. Get your personalized opportunity score. See exactly where your legal function could be creating more value.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span>Takes 5 minutes</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span>Get your personalized opportunity score</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span>No email required to see results</span>
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
                  <strong>Value Opportunity:</strong> {persona.painPoint}
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

  // Results Screen - Percentage Based
  if (currentStep === 'results' && scores) {
    const tierConfig = getTierConfig(scores.tier);

    const categoryBreakdown = [
      {
        category: "Contract Value Potential",
        icon: "📄",
        percentage: scores.breakdown.contract_opportunity,
        color: scores.breakdown.contract_opportunity > 70 ? "bg-red-500" : scores.breakdown.contract_opportunity > 40 ? "bg-orange-500" : "bg-orange-400"
      },
      {
        category: "Growth Enablement",
        icon: "🌍",
        percentage: scores.breakdown.growth_enablement,
        color: scores.breakdown.growth_enablement > 70 ? "bg-red-500" : scores.breakdown.growth_enablement > 40 ? "bg-orange-500" : "bg-orange-400"
      },
      {
        category: "Efficiency Gains",
        icon: "⚙️",
        percentage: scores.breakdown.cost_opportunity,
        color: scores.breakdown.cost_opportunity > 70 ? "bg-red-500" : scores.breakdown.cost_opportunity > 40 ? "bg-orange-500" : "bg-orange-400"
      }
    ];

    const handleBookCall = () => {
      window.open('https://calendly.com/lineablu/insights-call', '_blank');
    };

    const handleLinkedInShare = () => {
      const shareText = `I just completed the LineaBlu Legal Value Score assessment and discovered ${scores.total}% growth opportunity in my legal function! 🚀`;
      const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(shareText)}`;
      window.open(shareUrl, '_blank', 'width=600,height=600');
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                L
              </div>
              <span className="text-xl font-semibold">LineaBlu</span>
            </div>
            <button
              onClick={() => {
                setCurrentStep('welcome');
                setAnswers({});
                setScores(null);
                setEmail('');
                setFirstName('');
                setLastName('');
                setCompanyName('');
              }}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <span>Start Over</span>
              <span className="text-xl">↻</span>
            </button>
          </div>

          {/* Persona Badge */}
          <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full inline-block mb-6 text-sm font-medium">
            {selectedPersona ? personas.find(p => p.id === selectedPersona)?.title || 'General' : 'General'} Assessment Complete
          </div>

          {/* Main Score Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <h1 className="text-3xl font-bold text-center mb-2">
              Your Growth Opportunity Score
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Here's how much untapped value we've identified in your legal function.
            </p>

            {/* Circular Progress */}
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#E5E7EB"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - scores.total / 100)}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#1E3A8A" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-orange-600">{scores.total}%</span>
                  <span className="text-gray-500 text-sm">opportunity</span>
                </div>
              </div>
            </div>

            {/* Tier Badge */}
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${
                tierConfig.color === 'red' ? 'text-red-600' :
                tierConfig.color === 'orange' ? 'text-orange-600' :
                tierConfig.color === 'blue' ? 'text-blue-600' :
                'text-green-600'
              }`}>
                {tierConfig.title}
              </h2>
              <p className="text-gray-600">
                {tierConfig.message}
              </p>
            </div>

            {/* Category Breakdown Bars */}
            <div className="space-y-4">
              {categoryBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm font-bold text-orange-600">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What We'll Discuss Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">What We'll Discuss in Your Call</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Based on your assessment, here are the specific topics we'll cover in your 20-minute insights call:
            </p>
            <div className="space-y-4">
              {categoryBreakdown
                .sort((a, b) => b.percentage - a.percentage)
                .slice(0, 3)
                .map((item, index) => {
                  const discussionPoints: Record<string, string> = {
                    "Contract Value Potential": "Identifying hidden value in your contracts: automatic renewals, price escalations, and rebate opportunities you're likely missing",
                    "Growth Enablement": "How to structure legal support for your expansion plans without creating bottlenecks or budget surprises",
                    "Efficiency Gains": "Practical ways to reduce outside counsel spend and accelerate deal velocity with embedded legal support"
                  };

                  return (
                    <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{item.icon}</span>
                          <h4 className="font-semibold text-gray-900">{item.category}</h4>
                          <span className="text-sm font-bold text-orange-600">({item.percentage}% opportunity)</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {discussionPoints[item.category]}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <p className="text-sm text-gray-700">
                <strong>This isn't a sales call.</strong> We'll share specific insights from 100+ similar assessments and give you actionable next steps—whether you work with us or not.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-lg p-8 mb-6 text-white">
            <h2 className="text-3xl font-bold text-center mb-4">
              Ready to unlock this growth potential?
            </h2>
            <p className="text-blue-100 text-center mb-8 leading-relaxed">
              Book your 20-minute insights call now. We'll send you a prep document beforehand so we can dive straight into your specific situation.
            </p>

            {/* Primary CTA */}
            <button
              onClick={handleBookCall}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-xl mb-4 flex items-center justify-center gap-3 transition-colors"
            >
              <Calendar size={24} />
              <span className="text-lg">Book Your Insights Call</span>
              <span>→</span>
            </button>

            {/* LinkedIn Share */}
            <button
              onClick={handleLinkedInShare}
              className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 border border-blue-500 transition-colors"
            >
              <Share2 size={18} />
              <span>Share on LinkedIn</span>
            </button>
          </div>

          {/* Email Form */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Get Your Detailed Report</h3>
            <p className="text-gray-600 mb-6">
              Enter your details to receive a comprehensive analysis of your results and personalized recommendations.
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
