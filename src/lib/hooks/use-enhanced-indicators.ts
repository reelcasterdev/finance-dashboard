"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { IndicatorScore } from '@/lib/indicators/composite'
import { 
  calculatePiCycleTop, 
  calculateMVRV, 
  calculateStockToFlow,
  calculatePuellMultiple,
  calculateRainbowBands
} from '@/lib/indicators/calculations'

const REFRESH_INTERVAL = 60000 // 1 minute

// Fetch Bitcoin price and market data
export function useEnhancedBitcoinData() {
  return useQuery({
    queryKey: ['enhanced-bitcoin-data'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/bitcoin-price')
      return response.data
    },
    refetchInterval: REFRESH_INTERVAL,
  })
}

// Fetch Coinbase Premium
export function useCoinbasePremium() {
  return useQuery({
    queryKey: ['coinbase-premium'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/coinbase-premium')
      const data = response.data
      
      return {
        id: 'coinbase-premium',
        value: data.premium,
        signal: data.signal,
        confidence: Math.min(Math.abs(data.premium) * 20, 100),
        weight: 0.05,
        description: `Premium: ${data.premium.toFixed(2)}%`,
      } as IndicatorScore
    },
    refetchInterval: REFRESH_INTERVAL,
  })
}

// Fetch Market Depth and Order Book
export function useMarketDepth() {
  return useQuery({
    queryKey: ['market-depth'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/market-depth')
      const data = response.data
      
      // Convert market sentiment to indicator score
      let signal: 'buy' | 'neutral' | 'sell' = 'neutral'
      if (data.marketPressure.marketSentiment === 'bullish') signal = 'buy'
      if (data.marketPressure.marketSentiment === 'bearish') signal = 'sell'
      
      return {
        id: 'market-depth',
        value: data.marketPressure.bidAskRatio,
        signal,
        confidence: data.marketPressure.buyPressure,
        weight: 0.08,
        description: `Bid/Ask: ${data.marketPressure.bidAskRatio.toFixed(2)}`,
        orderBook: data.orderBook,
        trades: data.trades,
      }
    },
    refetchInterval: REFRESH_INTERVAL,
  })
}

// Fetch Funding Rates
export function useFundingRates() {
  return useQuery({
    queryKey: ['funding-rates'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/funding-rates')
      const data = response.data
      
      return {
        id: 'funding-rates',
        value: data.openInterest,
        signal: data.signal,
        confidence: data.confidence,
        weight: 0.06,
        description: `Open Interest: ${(data.openInterest / 1000).toFixed(1)}K BTC`,
      } as IndicatorScore
    },
    refetchInterval: REFRESH_INTERVAL * 2,
  })
}

// Calculate ATH Distance
export function useATHDistance(currentPrice: number, ath: number) {
  const distance = ((ath - currentPrice) / ath) * 100
  
  let signal: 'buy' | 'neutral' | 'sell' = 'neutral'
  let confidence = 50
  
  if (distance < 10) {
    signal = 'sell'
    confidence = 90
  } else if (distance > 50) {
    signal = 'buy'
    confidence = 70
  } else if (distance < 20) {
    signal = 'sell'
    confidence = 70
  } else if (distance > 40) {
    signal = 'buy'
    confidence = 60
  }
  
  return {
    id: 'ath-distance',
    value: 100 - distance, // Percentage of ATH
    signal,
    confidence,
    weight: 0.10,
    description: `${(100 - distance).toFixed(1)}% of ATH`,
  } as IndicatorScore
}

// Calculate Volume Trend
export function useVolumeTrend(volume24h: number, volume30d: number) {
  const avgDaily30d = volume30d / 30
  const volumeRatio = volume24h / avgDaily30d
  
  let signal: 'buy' | 'neutral' | 'sell' = 'neutral'
  let confidence = 50
  
  if (volumeRatio > 1.5) {
    signal = 'buy'
    confidence = 70
  } else if (volumeRatio < 0.5) {
    signal = 'sell'
    confidence = 60
  }
  
  return {
    id: 'volume-trend',
    value: volumeRatio,
    signal,
    confidence,
    weight: 0.08,
    description: `Volume ${volumeRatio > 1 ? '↑' : '↓'} ${(volumeRatio * 100).toFixed(0)}%`,
  } as IndicatorScore
}

// Enhanced composite indicators hook
export function useEnhancedIndicators() {
  const bitcoinData = useEnhancedBitcoinData()
  const coinbasePremium = useCoinbasePremium()
  const marketDepth = useMarketDepth()
  const fundingRates = useFundingRates()
  
  const indicators = new Map<string, IndicatorScore>()
  
  // Add all fetched indicators
  if (coinbasePremium.data) {
    indicators.set('coinbase-premium', coinbasePremium.data)
  }
  
  if (marketDepth.data) {
    indicators.set('market-depth', marketDepth.data)
  }
  
  if (fundingRates.data) {
    indicators.set('funding-rates', fundingRates.data)
  }
  
  // Calculate derived indicators from market data
  if (bitcoinData.data?.marketData) {
    const md = bitcoinData.data.marketData
    
    // ATH Distance
    const athIndicator = useATHDistance(md.currentPrice, md.ath)
    indicators.set('ath-distance', athIndicator)
    
    // Volume Trend
    const volumeIndicator = useVolumeTrend(md.totalVolume, md.totalVolume * 30)
    indicators.set('volume-trend', volumeIndicator)
    
    // Price momentum indicators
    const momentum30d = {
      id: 'momentum-30d',
      value: md.priceChangePercentage30d,
      signal: md.priceChangePercentage30d > 20 ? 'sell' as const : 
              md.priceChangePercentage30d < -20 ? 'buy' as const : 'neutral' as const,
      confidence: Math.min(Math.abs(md.priceChangePercentage30d) * 2, 100),
      weight: 0.07,
      description: `30d Change: ${md.priceChangePercentage30d.toFixed(1)}%`,
    }
    indicators.set('momentum-30d', momentum30d)
    
    // Supply metrics for S2F approximation
    const s2fIndicator = {
      id: 's2f',
      value: md.circulatingSupply / (328500), // Annual production estimate
      signal: 'neutral' as const,
      confidence: 60,
      weight: 0.22,
      description: `S2F Ratio: ${(md.circulatingSupply / 328500).toFixed(1)}`,
    }
    indicators.set('s2f', s2fIndicator)
  }
  
  return {
    indicators,
    isLoading: bitcoinData.isLoading || coinbasePremium.isLoading || 
               marketDepth.isLoading || fundingRates.isLoading,
    error: bitcoinData.error || coinbasePremium.error || 
           marketDepth.error || fundingRates.error,
    bitcoinData: bitcoinData.data,
  }
}