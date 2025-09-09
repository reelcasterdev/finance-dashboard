/**
 * Comprehensive signal calculation system for all indicators
 * Maps different signal types and calculates proper signals based on indicator-specific thresholds
 */

export type Signal = 'bullish' | 'bearish' | 'neutral'
export type OldSignal = 'buy' | 'sell' | 'neutral'

// Map old signal types to new
export function mapSignal(signal: OldSignal | Signal | string): Signal {
  switch (signal) {
    case 'buy':
    case 'strong-buy':
    case 'bullish':
      return 'bullish'
    case 'sell':
    case 'strong-sell':
    case 'bearish':
      return 'bearish'
    default:
      return 'neutral'
  }
}

// Indicator-specific thresholds and signal calculations
export const INDICATOR_SIGNALS = {
  // Fear & Greed Index (0-100)
  'fear-greed': (value: number): Signal => {
    if (value < 25) return 'bullish'  // Extreme fear = buying opportunity
    if (value > 75) return 'bearish'  // Extreme greed = selling opportunity
    if (value < 45) return 'bullish'  // Fear
    if (value > 55) return 'bearish'  // Greed
    return 'neutral'
  },

  // MVRV Z-Score
  'mvrv': (value: number): Signal => {
    if (value < 0) return 'bullish'    // Below 0 = strong buy
    if (value < 1) return 'bullish'    // Below 1 = buy
    if (value > 7) return 'bearish'    // Above 7 = extreme sell
    if (value > 3.5) return 'bearish'  // Above 3.5 = sell
    return 'neutral'
  },

  // Pi Cycle Top Indicator (distance between MAs)
  'pi-cycle': (value: number): Signal => {
    if (value < 0.1) return 'bearish'  // Lines very close = top signal
    if (value < 0.3) return 'bearish'  // Lines approaching
    if (value > 2) return 'bullish'    // Lines far apart = early cycle
    return 'neutral'
  },

  // Stock-to-Flow Deviation
  's2f': (value: number): Signal => {
    if (value < -50) return 'bullish'  // Far below model
    if (value < -20) return 'bullish'  // Below model
    if (value > 100) return 'bearish'  // Far above model
    if (value > 50) return 'bearish'   // Above model
    return 'neutral'
  },

  // Long-Term Holder Supply (percentage)
  'lth-supply': (value: number): Signal => {
    // When LTH supply is decreasing, they're selling (bearish)
    // When increasing, they're accumulating (bullish)
    if (value > 80) return 'bullish'   // Strong accumulation
    if (value > 70) return 'bullish'   // Accumulation
    if (value < 55) return 'bearish'   // Distribution
    return 'neutral'
  },

  // Puell Multiple
  'puell': (value: number): Signal => {
    if (value < 0.3) return 'bullish'  // Miner capitulation
    if (value < 0.5) return 'bullish'  // Low miner revenue
    if (value > 4) return 'bearish'    // Extreme profits
    if (value > 2.5) return 'bearish'  // High profits
    return 'neutral'
  },

  // Net Unrealized Profit/Loss (NUPL)
  'nupl': (value: number): Signal => {
    if (value < 0) return 'bullish'    // Capitulation
    if (value < 0.25) return 'bullish' // Hope
    if (value > 0.75) return 'bearish' // Euphoria
    if (value > 0.5) return 'bearish'  // Greed
    return 'neutral'
  },

  // RHODL Ratio
  'rhodl': (value: number): Signal => {
    if (value < 350) return 'bullish'   // Low ratio
    if (value < 1000) return 'bullish'  
    if (value > 50000) return 'bearish' // Extreme high
    if (value > 20000) return 'bearish'
    return 'neutral'
  },

  // Reserve Risk
  'reserve-risk': (value: number): Signal => {
    if (value < 0.002) return 'bullish'  // Low risk, high opportunity
    if (value < 0.01) return 'bullish'
    if (value > 0.02) return 'bearish'   // High risk
    if (value > 0.01) return 'bearish'
    return 'neutral'
  },

  // Rainbow Chart (price position in bands 0-10)
  'rainbow': (value: number): Signal => {
    if (value < 3) return 'bullish'   // Fire sale / Buy zones
    if (value < 4) return 'bullish'   // Accumulate
    if (value > 8) return 'bearish'   // FOMO / Bubble
    if (value > 6) return 'bearish'   // Is this a bubble?
    return 'neutral'
  },

  // ETF Flows (in millions)
  'etf-flows': (value: number): Signal => {
    if (value > 100) return 'bullish'   // Large inflows
    if (value > 0) return 'bullish'     // Inflows
    if (value < -100) return 'bearish'  // Large outflows
    if (value < 0) return 'bearish'     // Outflows
    return 'neutral'
  },

  // NVT Signal
  'nvt': (value: number): Signal => {
    if (value < 45) return 'bullish'   // Undervalued
    if (value < 65) return 'bullish'
    if (value > 150) return 'bearish'  // Overvalued
    if (value > 100) return 'bearish'
    return 'neutral'
  },

  // Exchange Reserves (BTC amount)
  'exchange-reserves': (value: number): Signal => {
    // Lower reserves = bullish (coins moving off exchanges)
    // Inverse relationship
    if (value < 2000000) return 'bullish'  // Low reserves
    if (value < 2300000) return 'bullish'
    if (value > 2800000) return 'bearish'  // High reserves
    if (value > 2600000) return 'bearish'
    return 'neutral'
  },

  // ATH Distance (percentage from ATH)
  'ath-distance': (value: number): Signal => {
    if (value < -70) return 'bullish'  // Far from ATH
    if (value < -50) return 'bullish'
    if (value > -10) return 'bearish'  // Close to ATH
    if (value > -20) return 'bearish'
    return 'neutral'
  },

  // Miner Position Index
  'mpi': (value: number): Signal => {
    if (value < 0) return 'bullish'    // Miners holding
    if (value < 0.5) return 'bullish'
    if (value > 2) return 'bearish'    // Miners selling heavily
    if (value > 1) return 'bearish'
    return 'neutral'
  },

  // Bitcoin Dominance (percentage)
  'btc-dominance': (value: number): Signal => {
    if (value > 70) return 'bullish'   // High dominance
    if (value > 60) return 'bullish'
    if (value < 40) return 'bearish'   // Low dominance (alt season)
    if (value < 50) return 'bearish'
    return 'neutral'
  },

  // 30-Day Momentum (percentage change)
  'momentum-30d': (value: number): Signal => {
    if (value > 20) return 'bullish'   // Strong positive momentum
    if (value > 5) return 'bullish'
    if (value < -20) return 'bearish'  // Strong negative momentum
    if (value < -5) return 'bearish'
    return 'neutral'
  },

  // Funding Rates (percentage)
  'funding-rates': (value: number): Signal => {
    if (value < -0.05) return 'bullish'  // Negative funding = oversold
    if (value < 0) return 'bullish'
    if (value > 0.1) return 'bearish'    // High funding = overleveraged
    if (value > 0.05) return 'bearish'
    return 'neutral'
  },

  // Coinbase Premium (percentage)
  'coinbase-premium': (value: number): Signal => {
    if (value > 0.5) return 'bullish'   // US buying pressure
    if (value > 0.1) return 'bullish'
    if (value < -0.5) return 'bearish'  // US selling pressure
    if (value < -0.1) return 'bearish'
    return 'neutral'
  },

  // Market Depth (bid/ask ratio)
  'market-depth': (value: number): Signal => {
    if (value > 1.5) return 'bullish'   // More bids than asks
    if (value > 1.1) return 'bullish'
    if (value < 0.7) return 'bearish'   // More asks than bids
    if (value < 0.9) return 'bearish'
    return 'neutral'
  },

  // Volume Trend (30d average ratio)
  'volume-trend': (value: number): Signal => {
    if (value > 1.5) return 'bullish'   // Increasing volume
    if (value > 1.1) return 'bullish'
    if (value < 0.7) return 'bearish'   // Decreasing volume
    if (value < 0.9) return 'bearish'
    return 'neutral'
  },

  // Network Congestion (mempool size in MB)
  'network-congestion': (value: number): Signal => {
    if (value < 50) return 'bullish'    // Low congestion
    if (value < 100) return 'neutral'
    if (value > 300) return 'bearish'   // High congestion
    if (value > 200) return 'bearish'
    return 'neutral'
  },

  // Fee Pressure (sats/vB)
  'fee-pressure': (value: number): Signal => {
    if (value < 10) return 'bearish'    // Low fees = low demand
    if (value < 30) return 'neutral'
    if (value > 100) return 'bullish'   // High fees = high demand
    if (value > 50) return 'bullish'
    return 'neutral'
  },

  // Hash Ribbons (recovery signal)
  'hash-ribbons': (value: number): Signal => {
    if (value > 0.8) return 'bullish'   // Miner recovery
    if (value > 0.5) return 'bullish'
    if (value < 0.2) return 'bearish'   // Miner capitulation
    if (value < 0.4) return 'bearish'
    return 'neutral'
  },

  // Difficulty Adjustment (percentage)
  'difficulty-adjustment': (value: number): Signal => {
    if (value < -10) return 'bullish'   // Large negative = miner capitulation
    if (value < -5) return 'bullish'
    if (value > 10) return 'bearish'    // Large positive = overheated
    if (value > 5) return 'neutral'
    return 'neutral'
  },

  // Lightning Network Capacity (BTC)
  'lightning-network': (value: number): Signal => {
    if (value > 5000) return 'bullish'  // Growing adoption
    if (value > 3000) return 'bullish'
    if (value < 1000) return 'bearish'  // Declining adoption
    return 'neutral'
  },

  // Miner Revenue (USD millions per day)
  'miner-revenue': (value: number): Signal => {
    if (value < 15) return 'bullish'    // Low revenue = accumulation
    if (value < 25) return 'bullish'
    if (value > 60) return 'bearish'    // High revenue = distribution
    if (value > 40) return 'bearish'
    return 'neutral'
  }
}

// Calculate confidence based on how extreme the value is
export function calculateConfidence(indicatorId: string, value: number, signal: Signal): number {
  // Base confidence on distance from neutral thresholds
  let confidence = 50 // Base confidence

  switch (indicatorId) {
    case 'fear-greed':
      if (value < 20 || value > 80) confidence = 90
      else if (value < 30 || value > 70) confidence = 75
      else if (value < 40 || value > 60) confidence = 60
      break

    case 'mvrv':
      if (value < -0.5 || value > 5) confidence = 90
      else if (value < 0.5 || value > 3) confidence = 75
      else if (value < 1 || value > 2) confidence = 60
      break

    case 'nupl':
      if (value < -0.25 || value > 0.9) confidence = 90
      else if (value < 0 || value > 0.75) confidence = 75
      else if (value < 0.25 || value > 0.5) confidence = 60
      break

    default:
      // For unknown indicators, use signal strength
      if (signal !== 'neutral') {
        confidence = 70
      }
  }

  return Math.min(100, Math.max(0, confidence))
}

// Main function to calculate signal for any indicator
export function calculateIndicatorSignal(
  indicatorId: string, 
  value: number | string
): { signal: Signal; confidence: number } {
  // Convert value to number if needed
  const numValue = typeof value === 'number' ? value : parseFloat(value as string)
  
  if (isNaN(numValue)) {
    return { signal: 'neutral', confidence: 0 }
  }

  // Get signal calculator for this indicator
  const calculator = INDICATOR_SIGNALS[indicatorId as keyof typeof INDICATOR_SIGNALS]
  
  if (!calculator) {
    // Default logic for unknown indicators
    return { signal: 'neutral', confidence: 30 }
  }

  const signal = calculator(numValue)
  const confidence = calculateConfidence(indicatorId, numValue, signal)

  return { signal, confidence }
}

// Type for indicator data
export interface IndicatorData {
  id: string
  name: string
  value: number | string
  signal: string
  confidence: number
  weight?: number
  [key: string]: unknown // Allow additional properties
}

// Batch process multiple indicators
export function processIndicators(indicators: Map<string, IndicatorData>): Map<string, IndicatorData> {
  const processed = new Map<string, IndicatorData>()

  indicators.forEach((indicator, id) => {
    const { signal, confidence } = calculateIndicatorSignal(id, indicator.value)
    
    processed.set(id, {
      ...indicator,
      id: indicator.id || id,
      name: indicator.name || id,
      value: indicator.value,
      signal: mapSignal(indicator.signal || signal),
      confidence: indicator.confidence ?? confidence,
    })
  })

  return processed
}