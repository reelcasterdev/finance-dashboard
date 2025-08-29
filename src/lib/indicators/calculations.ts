export interface PriceData {
  timestamp: Date;
  price: number;
}

export interface IndicatorResult {
  value: number;
  signal: 'buy' | 'neutral' | 'sell';
  confidence: number;
  description?: string;
}

// Calculate Simple Moving Average
export function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return 0;
  const slice = data.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

// Calculate Exponential Moving Average
export function calculateEMA(data: number[], period: number): number {
  if (data.length === 0) return 0;
  const multiplier = 2 / (period + 1);
  let ema = data[0];
  
  for (let i = 1; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

// Pi Cycle Top Indicator
export function calculatePiCycleTop(prices: PriceData[]): IndicatorResult {
  if (prices.length < 350) {
    return {
      value: 0,
      signal: 'neutral',
      confidence: 0,
      description: 'Insufficient data for Pi Cycle calculation',
    };
  }

  const priceValues = prices.map(p => p.price);
  const ma111 = calculateSMA(priceValues, 111);
  const ma350x2 = calculateSMA(priceValues, 350) * 2;
  
  const currentPrice = priceValues[priceValues.length - 1];
  const ratio = ma111 / ma350x2;
  
  let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
  let confidence = 0;
  
  if (ratio >= 0.98) {
    signal = 'sell';
    confidence = Math.min((ratio - 0.98) * 50, 100);
  } else if (ratio <= 0.5) {
    signal = 'buy';
    confidence = Math.min((0.5 - ratio) * 100, 100);
  } else {
    signal = 'neutral';
    confidence = 50;
  }
  
  return {
    value: ratio,
    signal,
    confidence,
    description: `111DMA vs 350DMA×2: ${(ratio * 100).toFixed(2)}%`,
  };
}

// MVRV Ratio (Market Value / Realized Value)
// This is a simplified calculation - real MVRV requires on-chain data
export function calculateMVRV(marketCap: number, realizedCap: number): IndicatorResult {
  const mvrv = marketCap / realizedCap;
  
  let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
  let confidence = 0;
  
  if (mvrv >= 3.5) {
    signal = 'sell';
    confidence = Math.min((mvrv - 3.5) * 30, 100);
  } else if (mvrv <= 1.0) {
    signal = 'buy';
    confidence = Math.min((1.0 - mvrv) * 100, 100);
  } else if (mvrv >= 2.5) {
    signal = 'sell';
    confidence = 60;
  } else if (mvrv <= 1.5) {
    signal = 'buy';
    confidence = 60;
  } else {
    signal = 'neutral';
    confidence = 50;
  }
  
  return {
    value: mvrv,
    signal,
    confidence,
    description: `MVRV Ratio: ${mvrv.toFixed(2)}`,
  };
}

// Stock-to-Flow Model
export function calculateStockToFlow(currentBlock: number): IndicatorResult {
  const blocksPerYear = 52560; // Approximately 144 blocks/day * 365 days
  const currentSupply = 19000000; // Approximate current supply
  const yearlyProduction = (currentBlock < 840000) ? 328500 : 164250; // After halving
  
  const stockToFlow = currentSupply / yearlyProduction;
  const modelPrice = Math.exp(14.6) * Math.pow(stockToFlow, 3.3); // S2F model formula
  
  let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
  let confidence = 0;
  
  if (stockToFlow >= 100) {
    signal = 'buy';
    confidence = 80;
  } else if (stockToFlow >= 50) {
    signal = 'neutral';
    confidence = 60;
  } else {
    signal = 'sell';
    confidence = 50;
  }
  
  return {
    value: stockToFlow,
    signal,
    confidence,
    description: `S2F Ratio: ${stockToFlow.toFixed(1)}, Model Price: $${modelPrice.toFixed(0)}`,
  };
}

// Puell Multiple
export function calculatePuellMultiple(
  dailyIssuanceUSD: number,
  ma365IssuanceUSD: number
): IndicatorResult {
  const puellMultiple = dailyIssuanceUSD / ma365IssuanceUSD;
  
  let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
  let confidence = 0;
  
  if (puellMultiple >= 4.0) {
    signal = 'sell';
    confidence = 90;
  } else if (puellMultiple >= 2.5) {
    signal = 'sell';
    confidence = 70;
  } else if (puellMultiple <= 0.5) {
    signal = 'buy';
    confidence = 90;
  } else if (puellMultiple <= 1.0) {
    signal = 'buy';
    confidence = 60;
  } else {
    signal = 'neutral';
    confidence = 50;
  }
  
  return {
    value: puellMultiple,
    signal,
    confidence,
    description: `Puell Multiple: ${puellMultiple.toFixed(2)}`,
  };
}

// Rainbow Chart Price Bands
export function calculateRainbowBands(daysSinceGenesis: number): {
  bands: { name: string; price: number; color: string }[];
  currentBand: string;
} {
  const x = Math.log10(daysSinceGenesis);
  
  // Rainbow chart regression formula
  const basePrice = Math.pow(10, 2.66 * x - 6.12);
  
  const bands = [
    { name: 'Maximum Bubble', price: basePrice * 8, color: '#FF0000' },
    { name: 'Sell', price: basePrice * 5, color: '#FF7F00' },
    { name: 'FOMO', price: basePrice * 3, color: '#FFFF00' },
    { name: 'Is This A Bubble?', price: basePrice * 2, color: '#7FFF00' },
    { name: 'HODL', price: basePrice * 1.5, color: '#00FF00' },
    { name: 'Still Cheap', price: basePrice * 1, color: '#00FF7F' },
    { name: 'Accumulate', price: basePrice * 0.7, color: '#00FFFF' },
    { name: 'Buy', price: basePrice * 0.5, color: '#007FFF' },
    { name: 'Fire Sale', price: basePrice * 0.3, color: '#0000FF' },
  ];
  
  return {
    bands,
    currentBand: 'HODL', // This would be determined by comparing current price
  };
}