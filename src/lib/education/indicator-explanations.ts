export interface IndicatorEducation {
  id: string
  name: string
  beginnerName: string // Simplified name for beginners
  category: 'on-chain' | 'market' | 'sentiment' | 'technical'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  
  // Plain English explanations
  whatItMeans: string
  howToRead: string
  whenToUse: string
  limitations: string
  
  // Beginner-friendly interpretation
  beginnerInterpretation: {
    veryLow: string
    low: string
    neutral: string
    high: string
    veryHigh: string
  }
  
  // Educational content
  formula?: string
  example?: string
  proTip?: string
  accuracy?: string
  
  // Visual helpers
  goodRange?: { min: number; max: number }
  warningRange?: { min: number; max: number }
  dangerRange?: { min: number; max: number }
}

export const INDICATOR_EXPLANATIONS: Record<string, IndicatorEducation> = {
  'pi-cycle': {
    id: 'pi-cycle',
    name: 'Pi Cycle Top Indicator',
    beginnerName: 'Cycle Top Signal',
    category: 'technical',
    difficulty: 'intermediate',
    whatItMeans: 'The Pi Cycle indicator uses two moving averages (111-day and 350-day x 2) to identify potential market cycle tops. When these lines cross, it has historically marked Bitcoin peaks within a few days.',
    howToRead: 'When the fast line approaches the slow line, the market may be overheated. A cross has marked the top in 3 previous cycles.',
    whenToUse: 'Best used during strong bull markets to identify potential exit points. Less useful during bear markets or sideways action.',
    limitations: 'Only 3 historical samples. May not work if market structure changes. Can give false signals in strong trends.',
    beginnerInterpretation: {
      veryLow: 'Market is very cold - nowhere near a top',
      low: 'Early in the cycle - accumulation phase',
      neutral: 'Mid-cycle - steady growth phase',
      high: 'Getting heated - watch carefully',
      veryHigh: 'DANGER: Potential cycle top approaching!'
    },
    formula: 'Distance between 111 DMA and (350 DMA × 2)',
    example: 'In April 2021, Pi Cycle crossed 3 days before Bitcoin peaked at $64k',
    proTip: 'Combine with on-chain metrics like MVRV for confirmation',
    accuracy: '100% accuracy for major tops (3/3), but limited data',
  },

  'mvrv': {
    id: 'mvrv',
    name: 'MVRV Z-Score',
    beginnerName: 'Profit/Loss Meter',
    category: 'on-chain',
    difficulty: 'beginner',
    whatItMeans: 'MVRV shows the average profit or loss of all Bitcoin holders. A value of 2 means the average holder has 100% profit. It helps identify when Bitcoin is over or undervalued.',
    howToRead: 'Below 1 = holders in loss (good buying opportunity). Above 3 = excessive profit (potential selling zone). Best opportunities often below 0.',
    whenToUse: 'Excellent for identifying major cycle bottoms and tops. Most reliable for long-term investment decisions.',
    limitations: 'Can stay in extreme zones for months. Less useful for short-term trading.',
    beginnerInterpretation: {
      veryLow: '🟢 EXTREME OPPORTUNITY - Holders in loss, historically the best buying zone',
      low: '🟢 OPPORTUNITY - Bitcoin undervalued, good accumulation zone',
      neutral: '🟡 FAIR VALUE - Bitcoin reasonably priced',
      high: '🟠 CAUTION - Holders in high profit, consider taking some gains',
      veryHigh: '🔴 DANGER - Excessive profits, high risk of correction'
    },
    formula: '(Market Cap - Realized Cap) / Standard Deviation',
    example: 'MVRV dropped below 0 in March 2020 ($5k) and November 2022 ($16k) - both were generational buying opportunities',
    proTip: 'MVRV below 1 has marked every major Bitcoin bottom',
    accuracy: '85% accuracy for major tops and bottoms',
    goodRange: { min: -0.5, max: 1 },
    warningRange: { min: 2.5, max: 3.5 },
    dangerRange: { min: 3.5, max: 10 }
  },

  's2f': {
    id: 's2f',
    name: 'Stock-to-Flow Deviation',
    beginnerName: 'Scarcity Model',
    category: 'on-chain',
    difficulty: 'intermediate',
    whatItMeans: 'Stock-to-Flow models Bitcoin price based on its scarcity (like gold). The deviation shows if Bitcoin is above or below this model price.',
    howToRead: 'Negative deviation = below model (undervalued). Positive = above model (overvalued). Extreme deviations often mark turning points.',
    whenToUse: 'Long-term valuation model. Best for identifying multi-year accumulation zones.',
    limitations: 'Model assumes constant demand. Breaks down during black swan events. Controversial among analysts.',
    beginnerInterpretation: {
      veryLow: '🟢 Far below model - Strong accumulation signal',
      low: '🟢 Below model - Good value zone',
      neutral: '🟡 Near model price - Fair valuation',
      high: '🟠 Above model - Getting expensive',
      veryHigh: '🔴 Far above model - Overvalued territory'
    },
    formula: 'Actual Price / S2F Model Price - 1',
    example: 'In March 2020, S2F deviation hit -65%, marking the COVID crash bottom',
    proTip: 'Works best when combined with on-chain activity metrics',
    accuracy: '70% accuracy, but decreasing over time'
  },

  'fear-greed': {
    id: 'fear-greed',
    name: 'Fear & Greed Index',
    beginnerName: 'Market Emotion',
    category: 'sentiment',
    difficulty: 'beginner',
    whatItMeans: 'A 0-100 score measuring market emotions. Combines price, volatility, social media, surveys, and dominance into one number. Low = fear (potential buying opportunity), High = greed (potential selling opportunity).',
    howToRead: '0-25: Extreme Fear (buy signal), 25-45: Fear, 45-55: Neutral, 55-75: Greed, 75-100: Extreme Greed (sell signal)',
    whenToUse: 'Great for timing short-term entries and exits. Best as a contrarian indicator - buy fear, sell greed.',
    limitations: 'Can remain extreme for weeks. Emotional, not fundamental. Lags during rapid moves.',
    beginnerInterpretation: {
      veryLow: '🟢 EXTREME FEAR - Everyone is scared, often the best time to buy',
      low: '🟢 FEAR - Market is worried, good accumulation opportunity',
      neutral: '🟡 NEUTRAL - Market is balanced, no clear direction',
      high: '🟠 GREED - Market getting excited, be cautious',
      veryHigh: '🔴 EXTREME GREED - Euphoria zone, consider taking profits'
    },
    example: 'Index hit 10 (extreme fear) in March 2020 before 10x rally',
    proTip: 'Below 20 has marked major bottoms, above 80 often precedes corrections',
    accuracy: '75% accuracy for short-term reversals',
    goodRange: { min: 0, max: 25 },
    warningRange: { min: 65, max: 80 },
    dangerRange: { min: 80, max: 100 }
  },

  'lth-supply': {
    id: 'lth-supply',
    name: 'Long-Term Holder Supply',
    beginnerName: 'Diamond Hands Meter',
    category: 'on-chain',
    difficulty: 'beginner',
    whatItMeans: 'Percentage of Bitcoin held by long-term investors (>155 days). High percentage means HODLers are accumulating. When it drops, long-term holders are selling.',
    howToRead: 'Rising = accumulation phase (bullish). Falling = distribution phase (bearish). Above 75% = strong holder base.',
    whenToUse: 'Identify accumulation/distribution phases. Great for spotting cycle transitions.',
    limitations: 'Lagging indicator. Definition of "long-term" is arbitrary.',
    beginnerInterpretation: {
      veryLow: '⚠️ Heavy distribution - Long-term holders selling aggressively',
      low: '🟠 Distribution phase - Some profit-taking happening',
      neutral: '🟡 Balanced - Normal holder behavior',
      high: '🟢 Accumulation - Smart money is buying and holding',
      veryHigh: '🟢 STRONG ACCUMULATION - Diamond hands dominating'
    },
    formula: 'Bitcoin unmoved for >155 days / Total Supply',
    example: 'LTH supply peaked at 79% in late 2020 before the bull run',
    proTip: 'When LTH supply starts declining after a peak, bull market is starting',
    accuracy: '80% correlation with major market cycles'
  },

  'puell': {
    id: 'puell',
    name: 'Puell Multiple',
    beginnerName: 'Miner Revenue Signal',
    category: 'on-chain',
    difficulty: 'intermediate',
    whatItMeans: 'Compares daily miner revenue to its yearly average. Shows if miners are earning unusually high or low amounts, indicating market extremes.',
    howToRead: 'Below 0.5 = miners stressed (bottom signal). Above 4 = miners very profitable (top signal).',
    whenToUse: 'Identifying major cycle extremes. Best for long-term positioning.',
    limitations: 'Affected by mining difficulty adjustments and halving events.',
    beginnerInterpretation: {
      veryLow: '🟢 MINER CAPITULATION - Historic buying opportunity',
      low: '🟢 Miners stressed - Accumulation zone',
      neutral: '🟡 Normal mining profitability',
      high: '🟠 Miners very profitable - Caution zone',
      veryHigh: '🔴 EXTREME PROFITS - Potential market top'
    },
    formula: 'Daily Mining Revenue (USD) / 365-day MA',
    example: 'Puell dropped below 0.5 in Dec 2018 and March 2020 - both major bottoms',
    proTip: 'Below 0.5 has marked every bear market bottom',
    accuracy: '82% accuracy for major reversals'
  },

  'nupl': {
    id: 'nupl',
    name: 'Net Unrealized Profit/Loss',
    beginnerName: 'Market Profit Tracker',
    category: 'on-chain',
    difficulty: 'intermediate',
    whatItMeans: 'Shows the overall profit or loss of all Bitcoin holders as a percentage. Positive = profit, Negative = loss. Extreme values mark cycle tops and bottoms.',
    howToRead: 'Below 0 = capitulation (buy), 0-0.25 = hope, 0.25-0.5 = optimism, 0.5-0.75 = greed, Above 0.75 = euphoria (sell)',
    whenToUse: 'Identifying market cycle phases and investor sentiment extremes.',
    limitations: 'Can remain in extreme zones for extended periods during strong trends.',
    beginnerInterpretation: {
      veryLow: '🟢 CAPITULATION - Maximum fear, historic buying opportunity',
      low: '🟢 HOPE - Recovery beginning, still good value',
      neutral: '🟡 OPTIMISM - Healthy market growth',
      high: '🟠 GREED - Market getting overheated',
      veryHigh: '🔴 EUPHORIA - Extreme greed, high crash risk'
    },
    formula: '(Market Cap - Realized Cap) / Market Cap',
    example: 'NUPL below 0 marked bottoms in 2015, 2018, and 2022',
    proTip: 'Combined with volume, NUPL effectively identifies accumulation zones',
    accuracy: '78% accuracy for cycle phases'
  },

  'rainbow': {
    id: 'rainbow',
    name: 'Rainbow Chart',
    beginnerName: 'Price Rainbow',
    category: 'technical',
    difficulty: 'beginner',
    whatItMeans: 'A logarithmic regression showing Bitcoin\'s long-term price trend with color bands. Each color represents a different valuation zone from "Fire Sale" to "Maximum Bubble".',
    howToRead: 'Blue/Green = undervalued (buy), Yellow = fair value (hold), Orange/Red = overvalued (sell). Price tends to oscillate between bands.',
    whenToUse: 'Long-term investment planning. Great for DCA strategies and identifying extremes.',
    limitations: 'Based on historical regression. Assumes continued logarithmic growth. Not for short-term trading.',
    beginnerInterpretation: {
      veryLow: '🟢 FIRE SALE - Extremely undervalued, maximum buy signal',
      low: '🟢 BUY ZONE - Great accumulation opportunity',
      neutral: '🟡 HOLD - Fairly valued, steady as she goes',
      high: '🟠 FOMO ZONE - Getting expensive, be careful',
      veryHigh: '🔴 BUBBLE ZONE - Extremely overvalued, consider selling'
    },
    formula: 'Log regression: Price = 10^(2.66 × log10(days) - 17.92)',
    example: 'Rainbow showed "Fire Sale" in March 2020 and "Bubble" in April 2021',
    proTip: 'DCA more aggressively in blue/green bands, reduce in orange/red',
    accuracy: '73% accuracy for long-term trends'
  },

  'etf-flows': {
    id: 'etf-flows',
    name: 'ETF Net Flows',
    beginnerName: 'Institutional Buying',
    category: 'market',
    difficulty: 'beginner',
    whatItMeans: 'Shows whether institutional investors are buying (inflows) or selling (outflows) Bitcoin through ETFs. Positive = institutions buying, Negative = institutions selling.',
    howToRead: 'Large inflows = institutional accumulation (bullish). Large outflows = institutional selling (bearish). Watch for trend changes.',
    whenToUse: 'Gauging institutional sentiment and potential price catalysts.',
    limitations: 'Only captures ETF activity, not all institutional buying. Can be noisy day-to-day.',
    beginnerInterpretation: {
      veryLow: '🔴 HEAVY OUTFLOWS - Institutions selling aggressively',
      low: '🟠 Outflows - Some institutional selling',
      neutral: '🟡 Balanced - Normal flows',
      high: '🟢 Inflows - Institutions accumulating',
      veryHigh: '🟢 MASSIVE INFLOWS - Institutional FOMO'
    },
    example: 'Record $1B inflows in February 2024 preceded 50% rally',
    proTip: 'Sustained inflows over weeks are more significant than daily spikes',
    accuracy: '68% correlation with 30-day price movement'
  }
}

// Helper function to get beginner-friendly interpretation
export function getBeginnerInterpretation(indicatorId: string, value: number, signal: 'bullish' | 'bearish' | 'neutral'): string {
  const explanation = INDICATOR_EXPLANATIONS[indicatorId]
  if (!explanation) return 'No explanation available'
  
  // Map signal to interpretation level
  if (signal === 'bullish') {
    if (value > 80) return explanation.beginnerInterpretation.veryHigh
    if (value > 60) return explanation.beginnerInterpretation.high
    return explanation.beginnerInterpretation.neutral
  } else if (signal === 'bearish') {
    if (value < 20) return explanation.beginnerInterpretation.veryLow
    if (value < 40) return explanation.beginnerInterpretation.low
    return explanation.beginnerInterpretation.neutral
  }
  
  return explanation.beginnerInterpretation.neutral
}

// Helper to get simplified indicator state for beginners
export function getSimplifiedState(value: number, signal: 'bullish' | 'bearish' | 'neutral'): string {
  if (signal === 'bullish') {
    if (value > 80) return 'Very High'
    if (value > 60) return 'High'
    if (value > 40) return 'Neutral'
    if (value > 20) return 'Low'
    return 'Very Low'
  } else if (signal === 'bearish') {
    if (value < 20) return 'Very Low'
    if (value < 40) return 'Low'
    if (value < 60) return 'Neutral'
    if (value < 80) return 'High'
    return 'Very High'
  }
  return 'Neutral'
}

// Get top 5 beginner-friendly indicators
export const BEGINNER_INDICATORS = [
  'fear-greed',
  'mvrv',
  'rainbow',
  'lth-supply',
  'etf-flows'
]

// Market cycle phases
export interface MarketCyclePhase {
  name: string
  description: string
  characteristics: string[]
  typicalDuration: string
  whatToDo: string[]
  indicators: string[]
}

export const MARKET_CYCLE_PHASES: MarketCyclePhase[] = [
  {
    name: 'Accumulation',
    description: 'Smart money quietly buying while sentiment is negative',
    characteristics: [
      'Price moving sideways after decline',
      'Low volatility',
      'Negative news but price holds',
      'Long-term holders accumulating'
    ],
    typicalDuration: '6-12 months',
    whatToDo: [
      'Start or increase DCA',
      'Build long-term positions',
      'Ignore negative sentiment'
    ],
    indicators: ['MVRV < 1', 'Fear < 30', 'LTH Supply rising']
  },
  {
    name: 'Early Bull',
    description: 'Price breaking out, sentiment improving',
    characteristics: [
      'Higher highs and higher lows',
      'Increasing volume',
      'Media attention growing',
      'FOMO beginning'
    ],
    typicalDuration: '6-9 months',
    whatToDo: [
      'Hold positions',
      'Take small profits on pumps',
      'Avoid leverage'
    ],
    indicators: ['MVRV 1-2', 'Fear 40-60', 'Rainbow: green']
  },
  {
    name: 'Late Bull',
    description: 'Euphoria phase with parabolic price action',
    characteristics: [
      'Vertical price movement',
      'Mainstream media coverage',
      'Everyone is a genius',
      'Taxi drivers giving tips'
    ],
    typicalDuration: '3-6 months',
    whatToDo: [
      'Take profits gradually',
      'Reduce position size',
      'Prepare for correction'
    ],
    indicators: ['MVRV > 3', 'Greed > 75', 'Rainbow: red']
  },
  {
    name: 'Distribution',
    description: 'Smart money selling to retail',
    characteristics: [
      'Price topping out',
      'High volatility',
      'Bull trap rallies',
      'Divergences appearing'
    ],
    typicalDuration: '2-6 months',
    whatToDo: [
      'Sell remaining positions',
      'Move to stablecoins',
      'Wait for better prices'
    ],
    indicators: ['Pi Cycle crossing', 'LTH Supply falling', 'NUPL > 0.75']
  },
  {
    name: 'Bear Market',
    description: 'Sustained downtrend with capitulation events',
    characteristics: [
      'Lower highs and lower lows',
      'Negative sentiment',
      'Forced selling',
      'Tax loss harvesting'
    ],
    typicalDuration: '12-18 months',
    whatToDo: [
      'Be patient',
      'Accumulate slowly',
      'Focus on education'
    ],
    indicators: ['MVRV < 0.8', 'Fear < 20', 'Rainbow: blue']
  }
]

// Calculate current market phase based on indicators
export function getCurrentMarketPhase(indicators: Map<string, {
  id: string
  name: string
  value: number | string
  signal: string | 'bullish' | 'bearish' | 'neutral'
  confidence: number
  weight?: number
  [key: string]: unknown
}>): MarketCyclePhase {
  // This is a simplified version - you'd want more sophisticated logic
  const mvrvValue = indicators.get('mvrv')?.value || 1
  const mvrv = typeof mvrvValue === 'number' ? mvrvValue : 1
  const fearGreedValue = indicators.get('fear-greed')?.value || 50
  const fearGreed = typeof fearGreedValue === 'number' ? fearGreedValue : 50
  
  if (mvrv < 1 && fearGreed < 30) {
    return MARKET_CYCLE_PHASES[0] // Accumulation
  } else if (mvrv >= 1 && mvrv < 2 && fearGreed < 60) {
    return MARKET_CYCLE_PHASES[1] // Early Bull
  } else if (mvrv >= 2 && fearGreed > 60) {
    return MARKET_CYCLE_PHASES[2] // Late Bull
  } else if (mvrv > 3) {
    return MARKET_CYCLE_PHASES[3] // Distribution
  } else {
    return MARKET_CYCLE_PHASES[4] // Bear
  }
}