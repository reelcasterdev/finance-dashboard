'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { IndicatorScore } from '@/lib/indicators/composite'

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// MVRV Ratio
export function useMVRV() {
  return useQuery({
    queryKey: ['mvrv'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/mvrv')
      return {
        id: 'mvrv',
        value: response.data.value,
        signal: response.data.signal,
        confidence: response.data.confidence,
        weight: response.data.weight,
        zScore: response.data.zScore
      } as IndicatorScore & { zScore: number }
    },
    refetchInterval: REFRESH_INTERVAL,
  })
}

// Long-Term Holder Supply
export function useLTHSupply() {
  return useQuery({
    queryKey: ['lth-supply'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/lth-supply')
      return {
        id: 'lth-supply',
        value: response.data.value,
        signal: response.data.signal,
        confidence: response.data.confidence,
        weight: response.data.weight,
        details: response.data.details
      } as IndicatorScore & { details: typeof response.data.details }
    },
    refetchInterval: REFRESH_INTERVAL,
  })
}

// Puell Multiple
export function usePuellMultiple() {
  return useQuery({
    queryKey: ['puell-multiple'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/puell-multiple')
      return {
        id: 'puell',
        value: response.data.value,
        signal: response.data.signal,
        confidence: response.data.confidence,
        weight: response.data.weight,
        details: response.data.details
      } as IndicatorScore & { details: typeof response.data.details }
    },
    refetchInterval: REFRESH_INTERVAL,
  })
}

// Miner Position Index
export function useMinerPosition() {
  return useQuery({
    queryKey: ['miner-position'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/miner-position')
      return {
        id: 'mpi',
        value: response.data.value,
        signal: response.data.signal,
        confidence: response.data.confidence,
        weight: response.data.weight,
        details: response.data.details
      } as IndicatorScore & { details: typeof response.data.details }
    },
    refetchInterval: REFRESH_INTERVAL,
  })
}

// Combined hook for all Bitcoin Magazine Pro indicators
export function useBitcoinMagazineIndicators() {
  const mvrv = useMVRV()
  const lthSupply = useLTHSupply()
  const puellMultiple = usePuellMultiple()
  const minerPosition = useMinerPosition()
  
  const indicators = new Map<string, IndicatorScore>()
  
  if (mvrv.data) {
    indicators.set('mvrv', mvrv.data)
  }
  
  if (lthSupply.data) {
    indicators.set('lth-supply', lthSupply.data)
  }
  
  if (puellMultiple.data) {
    indicators.set('puell', puellMultiple.data)
  }
  
  if (minerPosition.data) {
    indicators.set('mpi', minerPosition.data)
  }
  
  return {
    indicators,
    isLoading: mvrv.isLoading || lthSupply.isLoading || puellMultiple.isLoading || minerPosition.isLoading,
    error: mvrv.error || lthSupply.error || puellMultiple.error || minerPosition.error,
    data: {
      mvrv: mvrv.data,
      lthSupply: lthSupply.data,
      puellMultiple: puellMultiple.data,
      minerPosition: minerPosition.data
    }
  }
}