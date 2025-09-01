"use client"

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { IndicatorScore } from '@/lib/indicators/composite'

const REFRESH_INTERVAL = 120000 // 2 minutes

export function useNetworkHealth() {
  return useQuery({
    queryKey: ['network-health'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/network-health')
      return response.data
    },
    refetchInterval: REFRESH_INTERVAL,
  })
}

export function useNetworkIndicators() {
  const networkHealth = useNetworkHealth()
  
  const indicators = new Map<string, IndicatorScore>()
  
  if (networkHealth.data) {
    const data = networkHealth.data
    
    // Hash Ribbons indicator (real data!)
    indicators.set('hash-ribbons', {
      id: 'hash-ribbons',
      value: data.hashRibbons.hashRate,
      signal: data.hashRibbons.signal,
      confidence: data.hashRibbons.confidence,
      weight: 0.03,
      description: data.hashRibbons.description,
    })
    
    // Network Activity (NVT Ratio proxy with real data!)
    indicators.set('nvt', {
      id: 'nvt',
      value: data.networkActivity.nvtRatio,
      signal: data.networkActivity.signal,
      confidence: data.networkActivity.confidence,
      weight: 0.13,
      description: `NVT Ratio: ${data.networkActivity.nvtRatio.toFixed(1)}`,
    })
    
    // Fee Pressure indicator (new!)
    indicators.set('fee-pressure', {
      id: 'fee-pressure',
      value: data.fees.pressure.avgFee,
      signal: data.fees.pressure.signal,
      confidence: data.fees.pressure.confidence,
      weight: 0.05,
      description: data.fees.pressure.description,
    })
    
    // Network Congestion indicator (new!)
    indicators.set('network-congestion', {
      id: 'network-congestion',
      value: data.mempool.congestion.score,
      signal: data.mempool.congestion.signal,
      confidence: 60,
      weight: 0.05,
      description: `Congestion: ${data.mempool.congestion.level}`,
    })
    
    // Miner Revenue indicator
    indicators.set('miner-revenue', {
      id: 'miner-revenue',
      value: data.minersRevenue,
      signal: data.minersRevenue > 50000000 ? 'sell' : 'buy',
      confidence: 55,
      weight: 0.04,
      description: `Miner Revenue: $${(data.minersRevenue / 1000000).toFixed(1)}M`,
    })
    
    // Difficulty Adjustment indicator
    const diffChange = data.difficulty.difficultyChange;
    indicators.set('difficulty-adjustment', {
      id: 'difficulty-adjustment',
      value: diffChange,
      signal: diffChange > 10 ? 'sell' : diffChange < -10 ? 'buy' : 'neutral',
      confidence: Math.min(Math.abs(diffChange) * 3, 80),
      weight: 0.03,
      description: `Diff change: ${diffChange.toFixed(2)}%`,
    })
  }
  
  return {
    indicators,
    isLoading: networkHealth.isLoading,
    error: networkHealth.error,
    networkData: networkHealth.data,
  }
}