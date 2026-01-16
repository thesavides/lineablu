'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronRight, CheckCircle } from 'lucide-react';

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

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
            LineaBlu Legal Value Score™
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How much value is waiting to be unlocked in your legal function?
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Most businesses are sitting on hidden opportunities in their contracts, operations, and strategic positioning. Take our 5-minute assessment. Get your Growth Opportunity Score.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 mb-8 rounded-r-lg max-w-2xl mx-auto">
            <p className="text-gray-700 text-lg font-medium">
              💎 Answer 8 questions. Get your personalized opportunity score. See exactly where your legal function could be creating more value.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>Takes 5 minutes</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>Get your personalized opportunity score</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span>No email required to see results</span>
            </div>
          </div>
        </div>

        {/* Persona Selection Integrated */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Choose your role to get started
              </h2>
              <p className="text-lg text-gray-600">
                We'll tailor your assessment to focus on the opportunities most relevant to you
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {personas.map((persona) => (
                <Link
                  key={persona.id}
                  href={`/assessment?persona=${persona.id}`}
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
                  <p className="text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center">
                    {persona.message}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/assessment?persona=general"
                className="text-gray-600 hover:text-gray-900 underline text-sm"
              >
                Skip - I'll answer as a general user
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
