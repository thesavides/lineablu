'use client';

import React, { useState } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';
import { questions, calculateScores, getTierConfig, type Scores } from '@/utils/scoring-algorithm';

export default function AssessmentTool() {
  const [currentStep, setCurrentStep] = useState('welcome');
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
          persona: 'general',
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
              LineaBlu Legal Impact Score™
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Is your legal function slowing you down or speeding you up?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Most businesses don't know what's buried in their contracts until it costs them.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg">
            <p className="text-gray-700 text-lg">
              Answer 8 questions. Get your score. See exactly where your legal function creates value — or leaves it on the table.
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
            onClick={() => setCurrentStep('q1')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors flex items-center justify-center group"
          >
            Start Assessment
            <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
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
              Your Legal Impact Score
            </h2>
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4">
              <span className="text-5xl font-bold">{scores.total}</span>
            </div>
            <div className={`inline-block px-6 py-2 rounded-full text-white font-semibold bg-${tierConfig.color}-600`}>
              {tierConfig.title}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <p className="text-lg text-gray-700">{tierConfig.message}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Score Breakdown</h3>
            <ScoreGauge score={scores.breakdown.contract} label="Contract Management" />
            <ScoreGauge score={scores.breakdown.risk} label="Risk & Compliance" />
            <ScoreGauge score={scores.breakdown.efficiency} label="Operational Efficiency" />
            <ScoreGauge score={scores.breakdown.strategic} label="Strategic Alignment" />
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
