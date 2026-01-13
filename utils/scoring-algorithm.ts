export interface Question {
  text: string;
  options: {
    text: string;
    value: number;
    category: 'contract' | 'risk' | 'efficiency' | 'strategic';
  }[];
}

export interface Questions {
  [key: string]: Question;
}

export const questions: Questions = {
  q1: {
    text: "Do you have a central system tracking all contract obligations, renewal dates, and pricing escalations?",
    options: [
      { text: "Yes, comprehensive system", value: 4, category: 'contract' },
      { text: "Partial — some contracts tracked", value: 2, category: 'contract' },
      { text: "No centralized system", value: 0, category: 'contract' },
      { text: "I'm not sure", value: 0, category: 'contract' }
    ]
  },
  q2: {
    text: "Have you expanded into new markets in the last 18 months?",
    options: [
      { text: "Yes, multiple jurisdictions", value: 0, category: 'risk' },
      { text: "Yes, one new market", value: 1, category: 'risk' },
      { text: "Planning to expand", value: 2, category: 'risk' },
      { text: "No international operations", value: 4, category: 'risk' }
    ]
  },
  q3: {
    text: "How often does legal capacity become a bottleneck for commercial deals?",
    options: [
      { text: "Frequently (weekly or more)", value: 0, category: 'efficiency' },
      { text: "Occasionally (monthly)", value: 2, category: 'efficiency' },
      { text: "Rarely", value: 3, category: 'efficiency' },
      { text: "Never / We don't experience this", value: 4, category: 'efficiency' }
    ]
  },
  q4: {
    text: "What percentage of your legal budget goes to outside counsel?",
    options: [
      { text: "Over 75%", value: 0, category: 'efficiency' },
      { text: "50-75%", value: 1, category: 'efficiency' },
      { text: "25-50%", value: 2, category: 'efficiency' },
      { text: "Under 25%", value: 4, category: 'efficiency' }
    ]
  },
  q5: {
    text: "In the last year, have you discovered unexpected obligations or pricing increases after contracts were already in effect?",
    options: [
      { text: "Yes, multiple times", value: 0, category: 'contract' },
      { text: "Yes, once or twice", value: 2, category: 'contract' },
      { text: "No", value: 4, category: 'contract' },
      { text: "Unsure", value: 1, category: 'contract' }
    ]
  },
  q6: {
    text: "How confident are you in your compliance coverage across all jurisdictions where you operate?",
    options: [
      { text: "Very confident — audited regularly", value: 4, category: 'risk' },
      { text: "Moderately confident", value: 2, category: 'risk' },
      { text: "Somewhat confident", value: 1, category: 'risk' },
      { text: "Not confident", value: 0, category: 'risk' }
    ]
  },
  q7: {
    text: "How would your commercial teams describe working with legal?",
    options: [
      { text: "Strategic enabler", value: 4, category: 'strategic' },
      { text: "Neutral / transactional", value: 2, category: 'strategic' },
      { text: "Occasional blocker", value: 1, category: 'strategic' },
      { text: "Consistent friction point", value: 0, category: 'strategic' }
    ]
  },
  q8: {
    text: "When was your last comprehensive contract portfolio review?",
    options: [
      { text: "Within the last 6 months", value: 4, category: 'strategic' },
      { text: "6-12 months ago", value: 2, category: 'strategic' },
      { text: "Over a year ago", value: 1, category: 'strategic' },
      { text: "Never / Don't recall", value: 0, category: 'strategic' }
    ]
  }
};

export interface CategoryScores {
  contract: number;
  risk: number;
  efficiency: number;
  strategic: number;
}

export interface Scores {
  total: number;
  breakdown: CategoryScores;
  tier: 'optimized' | 'capable' | 'at-risk' | 'exposed';
}

export function calculateScores(answers: any): Scores {
  const categoryScores: CategoryScores = {
    contract: 0,
    risk: 0,
    efficiency: 0,
    strategic: 0
  };

  const categoryMaxes = {
    contract: 12,
    risk: 8,
    efficiency: 10,
    strategic: 12
  };

  // Sum scores by category
  Object.values(answers).forEach((answer: any) => {
    categoryScores[answer.category as keyof CategoryScores] += answer.value;
  });

  // Normalize to 0-25 scale
  const normalizedScores: CategoryScores = {
    contract: Math.round((categoryScores.contract / categoryMaxes.contract) * 25),
    risk: Math.round((categoryScores.risk / categoryMaxes.risk) * 25),
    efficiency: Math.round((categoryScores.efficiency / categoryMaxes.efficiency) * 25),
    strategic: Math.round((categoryScores.strategic / categoryMaxes.strategic) * 25)
  };

  const total = normalizedScores.contract + normalizedScores.risk +
                normalizedScores.efficiency + normalizedScores.strategic;

  const tier: 'optimized' | 'capable' | 'at-risk' | 'exposed' =
    total >= 80 ? 'optimized' :
    total >= 60 ? 'capable' :
    total >= 40 ? 'at-risk' : 'exposed';

  return {
    total,
    breakdown: normalizedScores,
    tier
  };
}

export interface TierConfig {
  title: string;
  color: string;
  message: string;
}

export function getTierConfig(tier: string): TierConfig {
  const configs: { [key: string]: TierConfig } = {
    optimized: {
      title: 'OPTIMIZED',
      color: 'green',
      message: 'Your legal function operates as a strategic asset. Focus on maintaining this advantage as you scale.'
    },
    capable: {
      title: 'CAPABLE WITH GAPS',
      color: 'yellow',
      message: "You're managing well, but there are opportunities to unlock more value and reduce hidden costs."
    },
    'at-risk': {
      title: 'AT RISK',
      color: 'orange',
      message: 'Significant blind spots exist. Without intervention, these will compound as you grow.'
    },
    exposed: {
      title: 'EXPOSED',
      color: 'red',
      message: 'Critical vulnerabilities detected. Immediate action recommended to prevent material loss or compliance failure.'
    }
  };

  return configs[tier];
}
