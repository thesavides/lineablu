export interface Question {
  text: string;
  options: {
    text: string;
    value: number;
    category: 'contract_opportunity' | 'growth_enablement' | 'cost_opportunity' | 'strategic_value';
  }[];
}

export interface Questions {
  [key: string]: Question;
}

// REFRAMED QUESTIONS - Opportunity-Based (per REFRAMING_BRIEF.md)
export const questions: Questions = {
  q1: {
    text: "How much value are you capturing from your existing contracts?",
    options: [
      { text: "Fully optimized - We track obligations, auto-negotiate renewals, and capture all rebates/discounts", value: 4, category: 'contract_opportunity' },
      { text: "Partially optimized - We track some contracts but miss opportunities regularly", value: 2, category: 'contract_opportunity' },
      { text: "Untapped potential - Significant value locked in contracts we could renegotiate or optimize", value: 0, category: 'contract_opportunity' },
      { text: "Unknown potential - We haven't assessed what's possible", value: 0, category: 'contract_opportunity' }
    ]
  },
  q2: {
    text: "What's your legal function's readiness to support aggressive growth?",
    options: [
      { text: "Growth-ready - Legal accelerates deals and expansion decisions", value: 4, category: 'growth_enablement' },
      { text: "Growth-neutral - Legal keeps pace but doesn't enable speed", value: 2, category: 'growth_enablement' },
      { text: "Growth-constrained - Legal capacity limits our market expansion", value: 0, category: 'growth_enablement' },
      { text: "Evaluating expansion - Planning growth but legal readiness unclear", value: 1, category: 'growth_enablement' }
    ]
  },
  q3: {
    text: "How much faster could you close deals with optimized legal support?",
    options: [
      { text: "Already optimized - Legal speeds up deals, rarely delays", value: 4, category: 'growth_enablement' },
      { text: "10-20% faster possible - Some process improvements would help", value: 3, category: 'growth_enablement' },
      { text: "30-50% faster possible - Significant opportunity to accelerate", value: 1, category: 'growth_enablement' },
      { text: "50%+ faster possible - Major efficiency gains available", value: 0, category: 'growth_enablement' }
    ]
  },
  q4: {
    text: "How much could you save by optimizing your legal cost structure?",
    options: [
      { text: "Already optimized - Our model is cost-effective and efficient", value: 4, category: 'cost_opportunity' },
      { text: "€50K-€100K annual savings possible - Some optimization opportunities", value: 2, category: 'cost_opportunity' },
      { text: "€100K-€250K annual savings possible - Significant restructuring opportunity", value: 1, category: 'cost_opportunity' },
      { text: "€250K+ annual savings possible - Major cost transformation available", value: 0, category: 'cost_opportunity' }
    ]
  },
  q5: {
    text: "How much uncaptured value exists in your current contract portfolio?",
    options: [
      { text: "Fully captured - We systematically extract all contract value", value: 4, category: 'contract_opportunity' },
      { text: "€50K-€150K uncaptured - Some rebates, discounts, or terms we could activate", value: 2, category: 'contract_opportunity' },
      { text: "€150K-€300K uncaptured - Significant opportunities buried in existing contracts", value: 1, category: 'contract_opportunity' },
      { text: "Unknown potential - Haven't assessed what value could be unlocked", value: 0, category: 'contract_opportunity' }
    ]
  },
  q6: {
    text: "How well-positioned is your legal function to support your 3-year strategic plan?",
    options: [
      { text: "Strategically aligned - Legal is integrated into planning and enables strategy", value: 4, category: 'strategic_value' },
      { text: "Tactically capable - Legal executes well but isn't in strategy conversations", value: 2, category: 'strategic_value' },
      { text: "Operationally focused - Legal handles day-to-day but not strategy", value: 1, category: 'strategic_value' },
      { text: "Transactional only - Legal is pure execution, no strategic input", value: 0, category: 'strategic_value' }
    ]
  },
  q7: {
    text: "How much value does your organization get from its legal function?",
    options: [
      { text: "High value partner - Legal accelerates business outcomes consistently", value: 4, category: 'strategic_value' },
      { text: "Solid contributor - Legal delivers but could add more value", value: 2, category: 'strategic_value' },
      { text: "Basic service - Legal does tasks but doesn't drive outcomes", value: 1, category: 'strategic_value' },
      { text: "Transactional only - Legal is reactive, not value-additive", value: 0, category: 'strategic_value' }
    ]
  },
  q8: {
    text: "How data-driven are your legal and commercial decisions?",
    options: [
      { text: "Fully data-enabled - Real-time contract intelligence informs all decisions", value: 4, category: 'strategic_value' },
      { text: "Periodic insights - We review data quarterly but not continuously", value: 2, category: 'strategic_value' },
      { text: "Limited visibility - We have data but don't use it strategically", value: 1, category: 'strategic_value' },
      { text: "No intelligence layer - Decisions made without contract/legal data", value: 0, category: 'strategic_value' }
    ]
  }
};

export interface CategoryScores {
  contract_opportunity: number;
  growth_enablement: number;
  cost_opportunity: number;
  strategic_value: number;
}

export interface ValuePotential {
  contract: number;
  growth: number;
  cost: number;
  strategic: number;
  total: number;
}

export interface Scores {
  total: number;
  breakdown: CategoryScores;
  valuePotential: ValuePotential;
  tier: 'maximized' | 'strong-foundation' | 'significant-opportunity' | 'transformational';
}

export function calculateScores(answers: any): Scores {
  const categoryScores: CategoryScores = {
    contract_opportunity: 0,
    growth_enablement: 0,
    cost_opportunity: 0,
    strategic_value: 0
  };

  const categoryMaxes = {
    contract_opportunity: 8,  // Questions 1 & 5
    growth_enablement: 8,      // Questions 2 & 3
    cost_opportunity: 4,       // Question 4
    strategic_value: 12        // Questions 6, 7, 8
  };

  // Sum scores by category
  Object.values(answers).forEach((answer: any) => {
    categoryScores[answer.category as keyof CategoryScores] += answer.value;
  });

  // Normalize to 0-25 scale per category
  const normalizedScores: CategoryScores = {
    contract_opportunity: Math.round((categoryScores.contract_opportunity / categoryMaxes.contract_opportunity) * 25),
    growth_enablement: Math.round((categoryScores.growth_enablement / categoryMaxes.growth_enablement) * 25),
    cost_opportunity: Math.round((categoryScores.cost_opportunity / categoryMaxes.cost_opportunity) * 25),
    strategic_value: Math.round((categoryScores.strategic_value / categoryMaxes.strategic_value) * 25)
  };

  const total = normalizedScores.contract_opportunity + normalizedScores.growth_enablement +
                normalizedScores.cost_opportunity + normalizedScores.strategic_value;

  // Calculate value potential per reframing brief methodology
  const valuePotential = calculateValuePotential(normalizedScores);

  const tier: 'maximized' | 'strong-foundation' | 'significant-opportunity' | 'transformational' =
    total >= 80 ? 'maximized' :
    total >= 60 ? 'strong-foundation' :
    total >= 40 ? 'significant-opportunity' : 'transformational';

  return {
    total,
    breakdown: normalizedScores,
    valuePotential,
    tier
  };
}

// Value Potential Calculation per REFRAMING_BRIEF.md
function calculateValuePotential(scores: CategoryScores): ValuePotential {
  // Contract Value Opportunity (Questions 1, 5)
  const contractScore = scores.contract_opportunity;
  let contract = 0;
  if (contractScore < 10) {
    contract = 225000; // €150K-€300K midpoint
  } else if (contractScore < 18) {
    contract = 100000; // €50K-€150K midpoint
  } else {
    contract = 30000; // €10K-€50K midpoint
  }

  // Growth Enablement Opportunity (Questions 2, 3)
  const growthScore = scores.growth_enablement;
  let growth = 0;
  if (growthScore < 10) {
    growth = 250000; // 20-30% velocity improvement
  } else if (growthScore < 18) {
    growth = 150000; // 10-15% improvement
  } else {
    growth = 75000; // 5-10% improvement
  }

  // Cost Optimization Opportunity (Question 4)
  const costScore = scores.cost_opportunity;
  let cost = 0;
  if (costScore < 10) {
    cost = 175000; // €100K-€250K midpoint
  } else if (costScore < 18) {
    cost = 75000; // €50K-€100K midpoint
  } else {
    cost = 30000; // €10K-€50K midpoint
  }

  // Strategic Value Opportunity (Questions 6, 7, 8)
  const strategicScore = scores.strategic_value;
  let strategic = 0;
  if (strategicScore < 10) {
    strategic = 75000; // €50K-€100K midpoint
  } else if (strategicScore < 18) {
    strategic = 37500; // €25K-€50K midpoint
  } else {
    strategic = 17500; // €10K-€25K midpoint
  }

  const total = contract + growth + cost + strategic;

  return {
    contract,
    growth,
    cost,
    strategic,
    total
  };
}

export interface TierConfig {
  title: string;
  color: string;
  message: string;
}

// Updated tier configurations per REFRAMING_BRIEF.md
export function getTierConfig(tier: string): TierConfig {
  const configs: { [key: string]: TierConfig } = {
    maximized: {
      title: 'MAXIMIZED VALUE',
      color: 'green',
      message: 'Your legal function is already operating at peak value creation. Focus on maintaining this competitive advantage.'
    },
    'strong-foundation': {
      title: 'STRONG FOUNDATION, GROWTH READY',
      color: 'blue',
      message: 'You have solid fundamentals with €150K-€300K in additional value waiting to be unlocked through optimization.'
    },
    'significant-opportunity': {
      title: 'SIGNIFICANT OPPORTUNITY',
      color: 'purple',
      message: 'Your legal function has €300K-€600K in untapped value potential across cost savings, revenue acceleration, and strategic positioning.'
    },
    transformational: {
      title: 'TRANSFORMATIONAL POTENTIAL',
      color: 'orange',
      message: 'Your legal function represents a major growth opportunity. €600K+ in annual value could be unlocked through strategic redesign.'
    }
  };

  return configs[tier];
}

// Helper function to format currency
export function formatCurrency(value: number): string {
  return `€${(value / 1000).toFixed(0)}K`;
}
