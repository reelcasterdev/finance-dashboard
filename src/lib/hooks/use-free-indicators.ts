"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { IndicatorScore } from '@/lib/indicators/composite'
import { useMemo } from 'react'

const REFRESH_INTERVAL = 60000 // 1 minute

// ETF Flows Hook
export function useETFFlows() {
  return useQuery({
    queryKey: ['etf-flows'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/etf-flows')
      const data = response.data
      
      return {
        id: 'etf-flows',
        value: data.flows.netFlow,
        signal: data.signal,
        confidence: data.confidence,
        weight: 0.15,
        flows: data.flows,
        gbtcPremium: data.gbtcPremium
      } as IndicatorScore & { flows: typeof data.flows; gbtcPremium: number }
    },
    refetchInterval: REFRESH_INTERVAL * 5, // 5 minutes
  })
}

// Live Funding Rates Hook
export function useLiveFundingRates() {
  return useQuery({
    queryKey: ['funding-rates-live'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/funding-rates-live')
      const data = response.data
      
      return {
        id: 'funding-rates',
        value: data.current.rate,
        signal: data.signal,
        confidence: data.confidence,
        weight: 0.06,
        exchanges: data.current,
        openInterest: data.openInterest,
        trend: data.trend
      } as IndicatorScore & { exchanges: typeof data.current; openInterest: number; trend: string }
    },
    refetchInterval: REFRESH_INTERVAL, // 1 minute for funding rates
  })
}

// Exchange Reserves Hook
export function useExchangeReserves() {
  return useQuery({
    queryKey: ['exchange-reserves'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/exchange-reserves')
      const data = response.data
      
      return {
        id: 'exchange-reserves',
        value: data.reserves.total,
        signal: data.signal,
        confidence: data.confidence,
        weight: 0.12,
        reserves: data.reserves,
        flows: data.flows
      } as IndicatorScore & { reserves: typeof data.reserves; flows: typeof data.flows }
    },
    refetchInterval: REFRESH_INTERVAL * 10, // 10 minutes
  })
}

// Global Premium Hook (Enhanced Coinbase Premium)
export function useGlobalPremium() {
  return useQuery({
    queryKey: ['global-premium'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/global-premium')
      const data = response.data
      
      return {
        id: 'coinbase-premium',
        value: data.premiums.us,
        signal: data.signal,
        confidence: data.confidence,
        weight: 0.05,
        premiums: data.premiums,
        spread: data.spread,
        dominantExchange: data.dominantExchange
      } as IndicatorScore & { premiums: typeof data.premiums; spread: typeof data.spread; dominantExchange: string }
    },
    refetchInterval: REFRESH_INTERVAL * 0.5, // 30 seconds for price data
  })
}

// Lightning Network Hook
export function useLightningNetwork() {
  return useQuery({
    queryKey: ['lightning-network'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/lightning-network')
      const data = response.data
      
      // Lightning isn't in the main indicators but provides valuable adoption metrics
      return {
        id: 'lightning-network',
        value: data.adoptionScore,
        signal: (data.signal === 'bullish' ? 'buy' : 
                data.signal === 'bearish' ? 'sell' : 'neutral') as 'buy' | 'sell' | 'neutral',
        confidence: data.confidence,
        weight: 0.02, // Small weight as supplementary indicator
        network: data.network,
        growth: data.growth,
        topNodes: data.topNodes
      } as IndicatorScore & { network: typeof data.network; growth: typeof data.growth; topNodes: typeof data.topNodes }
    },
    refetchInterval: REFRESH_INTERVAL * 30, // 30 minutes
  })
}

// Aggregated free indicators hook
export function useFreeIndicators() {
  const etfFlows = useETFFlows()
  const fundingRates = useLiveFundingRates()
  const exchangeReserves = useExchangeReserves()
  const globalPremium = useGlobalPremium()
  const lightning = useLightningNetwork()
  
  const indicators = useMemo(() => {
    const map = new Map<string, IndicatorScore>()
    // Add all indicators that loaded successfully
    if (etfFlows.data) {
      map.set('etf-flows', etfFlows.data)
    }
    
    if (fundingRates.data) {
      map.set('funding-rates', fundingRates.data)
    }
    
    if (exchangeReserves.data) {
      map.set('exchange-reserves', exchangeReserves.data)
    }
    
    if (globalPremium.data) {
      map.set('coinbase-premium', globalPremium.data)
    }
    
    if (lightning.data) {
      map.set('lightning-network', lightning.data)
    }
    
    return map
  }, [etfFlows.data, fundingRates.data, exchangeReserves.data, globalPremium.data, lightning.data])
  
  return {
    indicators,
    isLoading: etfFlows.isLoading || fundingRates.isLoading || 
               exchangeReserves.isLoading || globalPremium.isLoading || 
               lightning.isLoading,
    error: etfFlows.error || fundingRates.error || 
           exchangeReserves.error || globalPremium.error || 
           lightning.error,
    details: {
      etfFlows: etfFlows.data,
      fundingRates: fundingRates.data,
      exchangeReserves: exchangeReserves.data,
      globalPremium: globalPremium.data,
      lightning: lightning.data
    }
  }
}