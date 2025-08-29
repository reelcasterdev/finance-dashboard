import { INDICATOR_WEIGHTS } from './weights';

export interface IndicatorScore {
  id: string;
  value: number;
  signal: 'buy' | 'neutral' | 'sell';
  confidence: number;
  weight: number;
}

export interface CompositeScore {
  overall: number;
  signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell';
  peakProbability: number;
  weightedScores: IndicatorScore[];
  lastUpdate: Date;
}

export function calculateCompositeScore(
  indicators: Map<string, IndicatorScore>
): CompositeScore {
  let totalWeightedScore = 0;
  let totalWeight = 0;
  const weightedScores: IndicatorScore[] = [];

  // Calculate weighted score for each indicator
  INDICATOR_WEIGHTS.forEach(weight => {
    const indicator = indicators.get(weight.id);
    if (indicator) {
      // Convert signal to numeric score
      let signalScore = 0.5; // neutral
      if (indicator.signal === 'buy') signalScore = 0;
      if (indicator.signal === 'sell') signalScore = 1;
      
      // Adjust by confidence
      const confidenceAdjusted = signalScore * (indicator.confidence / 100);
      
      // Apply weight
      const weightedValue = confidenceAdjusted * weight.weight;
      totalWeightedScore += weightedValue;
      totalWeight += weight.weight;
      
      weightedScores.push({
        ...indicator,
        weight: weight.weight,
      });
    }
  });

  // Normalize to 0-100 scale
  const overallScore = totalWeight > 0 
    ? (totalWeightedScore / totalWeight) * 100 
    : 50;

  // Determine signal based on overall score
  let signal: CompositeScore['signal'] = 'neutral';
  if (overallScore >= 80) signal = 'strong-sell';
  else if (overallScore >= 65) signal = 'sell';
  else if (overallScore <= 20) signal = 'strong-buy';
  else if (overallScore <= 35) signal = 'buy';

  // Calculate peak probability (inverse of score for selling)
  const peakProbability = overallScore;

  return {
    overall: overallScore,
    signal,
    peakProbability,
    weightedScores,
    lastUpdate: new Date(),
  };
}

export function getSignalColor(signal: CompositeScore['signal']): string {
  switch (signal) {
    case 'strong-buy':
      return 'bg-indicator-strong-buy';
    case 'buy':
      return 'bg-indicator-buy';
    case 'neutral':
      return 'bg-indicator-neutral';
    case 'sell':
      return 'bg-indicator-sell';
    case 'strong-sell':
      return 'bg-indicator-strong-sell';
    default:
      return 'bg-discord-greyple';
  }
}

export function getSignalText(signal: CompositeScore['signal']): string {
  switch (signal) {
    case 'strong-buy':
      return 'Strong Buy - Accumulation Zone';
    case 'buy':
      return 'Buy - Good Entry Point';
    case 'neutral':
      return 'Neutral - Wait for Confirmation';
    case 'sell':
      return 'Sell - Consider Taking Profits';
    case 'strong-sell':
      return 'Strong Sell - Peak Zone';
    default:
      return 'No Signal';
  }
}