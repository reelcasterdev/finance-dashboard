"use client"

import { useQuery } from '@tanstack/react-query'
import { AlternativeClient } from '@/lib/api/alternative'
import { 
  calculatePiCycleTop
} from '@/lib/indicators/calculations'
import { IndicatorScore } from '@/lib/indicators/composite'
import { useMemo } from 'react'
import axios from 'axios'

const REFRESH_INTERVAL = 60000 // 1 minute

export function useBitcoinPrice() {
  return useQuery({
    queryKey: ['bitcoin-price'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/bitcoin-price')
      return response.data.coingecko
    },
    refetchInterval: REFRESH_INTERVAL,
  })
}

export function useBitcoinDominance() {
  return useQuery({
    queryKey: ['bitcoin-dominance'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/bitcoin-price')
      const marketData = response.data.marketData
      return {
        dominance: marketData.market_cap_percentage?.btc || 0,
        totalMarketCap: marketData.total_market_cap?.usd || 0,
        totalVolume: marketData.total_volume?.usd || 0,
      }
    },
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
      } as IndicatorScore & { history: Array<{ value: number; classification: string; timestamp: Date }> }
    },
    refetchInterval: REFRESH_INTERVAL * 5, // 5 minutes
  })
}

export function usePiCycleIndicator() {
  return useQuery({
    queryKey: ['pi-cycle'],
    queryFn: async () => {
      // For now, use mock data as we need historical prices
      // TODO: Add historical prices endpoint
      const prices = Array.from({ length: 365 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        price: 50000 + Math.random() * 20000
      }))
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
  
  const indicators = useMemo(() => {
    const map = new Map<string, IndicatorScore>()
  
    if (fearGreed.data) {
      map.set('fear-greed', fearGreed.data)
    }
  
    if (dominance.data) {
      map.set('btc-dominance', {
        id: 'btc-dominance',
        value: dominance.data.dominance,
        signal: dominance.data.dominance > 50 ? 'buy' : 'sell',
        confidence: Math.abs(dominance.data.dominance - 50),
        weight: 0.07,
      })
    }
  
    if (piCycle.data) {
      map.set('pi-cycle', piCycle.data)
    }
  
    // Add mock data for other indicators (would be real API calls)
    map.set('mvrv', {
      id: 'mvrv',
      value: 2.3,
      signal: 'neutral',
      confidence: 65,
      weight: 0.28,
    })
  
    map.set('s2f', {
      id: 's2f',
      value: 56,
      signal: 'buy',
      confidence: 70,
      weight: 0.22,
    })
  
    map.set('puell', {
      id: 'puell',
      value: 1.2,
      signal: 'neutral',
      confidence: 55,
      weight: 0.16,
    })
  
    return map
  }, [fearGreed.data, dominance.data, piCycle.data])
  
  return {
    indicators,
    isLoading: fearGreed.isLoading || dominance.isLoading || piCycle.isLoading,
    error: fearGreed.error || dominance.error || piCycle.error,
  }
}