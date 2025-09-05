'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { IndicatorScore } from '@/lib/indicators/composite'

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Rainbow Chart
export function useRainbowChart() {
  return useQuery({
    queryKey: ['rainbow-chart'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/rainbow-chart')
      return {
        id: 'rainbow',
        value: response.data.value,
        signal: response.data.signal,
        confidence: response.data.confidence,
        weight: response.data.weight,
        details: response.data.details
      } as IndicatorScore & { details: typeof response.data.details }
    },
    refetchInterval: REFRESH_INTERVAL * 2, // 10 minutes
  })
}

// NUPL (Net Unrealized Profit/Loss)
export function useNUPL() {
  return useQuery({
    queryKey: ['nupl'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/nupl')
      return {
        id: 'nupl',
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

// RHODL Ratio
export function useRHODL() {
  return useQuery({
    queryKey: ['rhodl-ratio'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/rhodl-ratio')
      return {
        id: 'rhodl',
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

// Reserve Risk
export function useReserveRisk() {
  return useQuery({
    queryKey: ['reserve-risk'],
    queryFn: async () => {
      const response = await axios.get('/api/indicators/reserve-risk')
      return {
        id: 'reserve-risk',
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

// Combined hook for all advanced indicators
export function useAdvancedIndicators() {
  const rainbowChart = useRainbowChart()
  const nupl = useNUPL()
  const rhodl = useRHODL()
  const reserveRisk = useReserveRisk()
  
  const indicators = new Map<string, IndicatorScore>()
  
  if (rainbowChart.data) {
    indicators.set('rainbow', rainbowChart.data)
  }
  
  if (nupl.data) {
    indicators.set('nupl', nupl.data)
  }
  
  if (rhodl.data) {
    indicators.set('rhodl', rhodl.data)
  }
  
  if (reserveRisk.data) {
    indicators.set('reserve-risk', reserveRisk.data)
  }
  
  return {
    indicators,
    isLoading: rainbowChart.isLoading || nupl.isLoading || rhodl.isLoading || reserveRisk.isLoading,
    error: rainbowChart.error || nupl.error || rhodl.error || reserveRisk.error,
    data: {
      rainbowChart: rainbowChart.data,
      nupl: nupl.data,
      rhodl: rhodl.data,
      reserveRisk: reserveRisk.data
    }
  }
}