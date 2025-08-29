"use client"

import { useQuery } from '@tanstack/react-query'
import { CoinGeckoClient } from '@/lib/api/coingecko'
import { AlternativeClient } from '@/lib/api/alternative'
import { 
  calculatePiCycleTop, 
  calculateMVRV, 
  calculateStockToFlow,
  calculatePuellMultiple 
} from '@/lib/indicators/calculations'
import { IndicatorScore } from '@/lib/indicators/composite'

const REFRESH_INTERVAL = 60000 // 1 minute

export function useBitcoinPrice() {
  const coingecko = new CoinGeckoClient('CG-iYoNMofVYgypjR2VwdaAa6zF')
  
  return useQuery({
    queryKey: ['bitcoin-price'],
    queryFn: () => coingecko.getBitcoinPrice(),
    refetchInterval: REFRESH_INTERVAL,
  })
}

export function useBitcoinDominance() {
  const coingecko = new CoinGeckoClient('CG-iYoNMofVYgypjR2VwdaAa6zF')
  
  return useQuery({
    queryKey: ['bitcoin-dominance'],
    queryFn: () => coingecko.getBitcoinDominance(),
    refetchInterval: REFRESH_INTERVAL,
  })
}

export function useFearGreedIndex() {
  const alternative = new AlternativeClient()
  
  return useQuery({
    queryKey: ['fear-greed'],
    queryFn: async () => {
      const data = await alternative.getFearAndGreedIndex()
      const signal = alternative.getSignalFromFearGreed(data.current.value)
      
      return {
        id: 'fear-greed',
        value: data.current.value,
        signal,
        confidence: Math.abs(50 - data.current.value) * 2,
        history: data.history,
      } as IndicatorScore & { history: any[] }
    },
    refetchInterval: REFRESH_INTERVAL * 5, // 5 minutes
  })
}

export function usePiCycleIndicator() {
  const coingecko = new CoinGeckoClient('CG-iYoNMofVYgypjR2VwdaAa6zF')
  
  return useQuery({
    queryKey: ['pi-cycle'],
    queryFn: async () => {
      const prices = await coingecko.getHistoricalPrices(365)
      const result = calculatePiCycleTop(prices)
      
      return {
        id: 'pi-cycle',
        ...result,
        weight: 0.30,
      } as IndicatorScore
    },
    refetchInterval: REFRESH_INTERVAL * 10, // 10 minutes
  })
}

export function useAllIndicators() {
  const fearGreed = useFearGreedIndex()
  const dominance = useBitcoinDominance()
  const piCycle = usePiCycleIndicator()
  const price = useBitcoinPrice()
  
  const indicators = new Map<string, IndicatorScore>()
  
  if (fearGreed.data) {
    indicators.set('fear-greed', fearGreed.data)
  }
  
  if (dominance.data) {
    indicators.set('btc-dominance', {
      id: 'btc-dominance',
      value: dominance.data.dominance,
      signal: dominance.data.dominance > 50 ? 'buy' : 'sell',
      confidence: Math.abs(dominance.data.dominance - 50),
      weight: 0.07,
    })
  }
  
  if (piCycle.data) {
    indicators.set('pi-cycle', piCycle.data)
  }
  
  // Add mock data for other indicators (would be real API calls)
  indicators.set('mvrv', {
    id: 'mvrv',
    value: 2.3,
    signal: 'neutral',
    confidence: 65,
    weight: 0.28,
  })
  
  indicators.set('s2f', {
    id: 's2f',
    value: 56,
    signal: 'buy',
    confidence: 70,
    weight: 0.22,
  })
  
  indicators.set('puell', {
    id: 'puell',
    value: 1.2,
    signal: 'neutral',
    confidence: 55,
    weight: 0.16,
  })
  
  return {
    indicators,
    isLoading: fearGreed.isLoading || dominance.isLoading || piCycle.isLoading,
    error: fearGreed.error || dominance.error || piCycle.error,
  }
}