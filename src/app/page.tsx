"use client"

import { useMemo } from 'react'
import { CompositeScore } from '@/components/dashboard/composite-score'
import { MarketOverview } from '@/components/dashboard/market-overview'
import { IndicatorCard } from '@/components/indicators/indicator-card'
import { Badge } from '@/components/ui/badge'
import { calculateCompositeScore, CompositeScore as CompositeScoreType } from '@/lib/indicators/composite'
import { INDICATOR_WEIGHTS } from '@/lib/indicators/weights'
import { useAllIndicators } from '@/lib/hooks/use-indicators'
import { useEnhancedIndicators } from '@/lib/hooks/use-enhanced-indicators'
import { useNetworkIndicators } from '@/lib/hooks/use-network-indicators'
import { useFreeIndicators } from '@/lib/hooks/use-free-indicators'
import { useBitcoinMagazineIndicators } from '@/lib/hooks/use-bitcoin-magazine'
import { useAdvancedIndicators } from '@/lib/hooks/use-advanced-indicators'
import { Activity, BarChart3, TrendingUp, Zap } from 'lucide-react'


export default function DashboardPage() {
  const basicIndicators = useAllIndicators()
  const enhancedIndicators = useEnhancedIndicators()
  const networkIndicators = useNetworkIndicators()
  const freeIndicators = useFreeIndicators()
  const bitcoinMagazineIndicators = useBitcoinMagazineIndicators()
  const advancedIndicators = useAdvancedIndicators()
  
  // Merge indicators from all sources
  const indicators = useMemo(() => {
    const merged = new Map()
    // Only merge if not loading to ensure stable data
    if (!basicIndicators.isLoading) {
      basicIndicators.indicators.forEach((value, key) => merged.set(key, value))
    }
    if (!enhancedIndicators.isLoading) {
      enhancedIndicators.indicators.forEach((value, key) => merged.set(key, value))
    }
    if (!networkIndicators.isLoading) {
      networkIndicators.indicators.forEach((value, key) => merged.set(key, value))
    }
    if (!freeIndicators.isLoading) {
      freeIndicators.indicators.forEach((value, key) => merged.set(key, value))
    }
    if (!bitcoinMagazineIndicators.isLoading) {
      bitcoinMagazineIndicators.indicators.forEach((value, key) => merged.set(key, value))
    }
    if (!advancedIndicators.isLoading) {
      advancedIndicators.indicators.forEach((value, key) => merged.set(key, value))
    }
    return merged
  }, [
    basicIndicators.isLoading,
    enhancedIndicators.isLoading,
    networkIndicators.isLoading,
    freeIndicators.isLoading,
    bitcoinMagazineIndicators.isLoading,
    advancedIndicators.isLoading,
    basicIndicators.indicators,
    enhancedIndicators.indicators,
    networkIndicators.indicators,
    freeIndicators.indicators,
    bitcoinMagazineIndicators.indicators,
    advancedIndicators.indicators
  ])
  
  const isLoading = basicIndicators.isLoading || enhancedIndicators.isLoading || networkIndicators.isLoading || freeIndicators.isLoading || bitcoinMagazineIndicators.isLoading || advancedIndicators.isLoading
  
  // Calculate composite score directly without useEffect to avoid loops
  const compositeScore = useMemo<CompositeScoreType>(() => {
    if (indicators.size > 0 && !isLoading) {
      return calculateCompositeScore(indicators)
    }
    return {
      overall: 50,
      signal: 'neutral',
      peakProbability: 50,
      weightedScores: [],
      lastUpdate: new Date(),
    }
  }, [indicators, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Skeleton */}
          <div className="text-center space-y-4 py-8 mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg opacity-50">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 opacity-50">
              Bitcoin Peak Indicator Dashboard
            </h1>
            <div className="flex justify-center gap-3 pt-4">
              <div className="h-7 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-7 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-7 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-8">
            {/* Market Overview and Composite Score Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-40 mb-6"></div>
                  <div className="w-48 h-24 mx-auto bg-gray-100 rounded-t-full mb-4"></div>
                  <div className="text-center space-y-3">
                    <div className="h-12 bg-gray-200 rounded w-20 mx-auto"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-28 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicator Cards Skeleton */}
            {['Primary', 'Secondary', 'Supporting'].map((section, sectionIdx) => (
              <div key={section}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div>
                    <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className={`grid gap-4 ${
                  sectionIdx === 0 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                }`}>
                  {Array.from({ length: sectionIdx === 0 ? 3 : 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-100 rounded"></div>
                        <div className="h-1 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Loading Overlay */}
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
              <div className="flex flex-col items-center space-y-4">
                {/* Simple spinner */}
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-3 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-3 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-gray-900 font-medium">Loading indicators</p>
                  <p className="text-sm text-gray-500 mt-1">Please wait...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Bitcoin Peak Indicator Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced multi-indicator analysis for Bitcoin market cycle detection
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Badge variant="success" className="px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1.5" />
              Live Data
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              27 Indicators
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Auto Refresh
            </Badge>
          </div>
        </div>

        {/* Top Section - Market Overview and Composite Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MarketOverview bitcoinData={enhancedIndicators.bitcoinData} />
          </div>
          <div className="lg:col-span-1">
            <CompositeScore
              score={compositeScore.overall}
              signal={compositeScore.signal}
              peakProbability={compositeScore.peakProbability}
              lastUpdate={compositeScore.lastUpdate}
            />
          </div>
        </div>

        {/* Indicators Sections */}
        <div className="space-y-8">
          {/* Primary Indicators */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Primary Indicators
                </h2>
                <p className="text-sm text-gray-500">High impact signals (10%+ normalized weight)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDICATOR_WEIGHTS.filter(w => w.weight >= 0.10).map(weight => {
                const indicator = indicators.get(weight.id)
                if (!indicator) {
                  return (
                    <IndicatorCard
                      key={weight.id}
                      name={weight.name}
                      value="Loading..."
                      signal="neutral"
                      weight={weight.weight}
                      confidence={0}
                      description={weight.description}
                      dataSource={weight.dataSource}
                      isLive={weight.isLive}
                    />
                  )
                }
                return (
                  <IndicatorCard
                    key={weight.id}
                    name={weight.name}
                    value={indicator.value}
                    signal={indicator.signal}
                    weight={weight.weight}
                    confidence={indicator.confidence}
                    description={weight.description}
                    lastUpdate={new Date()}
                    dataSource={weight.dataSource}
                    isLive={weight.isLive}
                  />
                )
              })}
            </div>
          </section>

          {/* Secondary Indicators */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Secondary Indicators
                </h2>
                <p className="text-sm text-gray-500">Medium impact signals (5-10% normalized weight)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {INDICATOR_WEIGHTS.filter(w => w.weight >= 0.05 && w.weight < 0.10).map(weight => {
                const indicator = indicators.get(weight.id)
                if (!indicator) {
                  return (
                    <IndicatorCard
                      key={weight.id}
                      name={weight.name}
                      value="Loading..."
                      signal="neutral"
                      weight={weight.weight}
                      confidence={0}
                      description={weight.description}
                      dataSource={weight.dataSource}
                      isLive={weight.isLive}
                    />
                  )
                }
                return (
                  <IndicatorCard
                    key={weight.id}
                    name={weight.name}
                    value={indicator.value}
                    signal={indicator.signal}
                    weight={weight.weight}
                    confidence={indicator.confidence}
                    description={weight.description}
                    lastUpdate={new Date()}
                    dataSource={weight.dataSource}
                    isLive={weight.isLive}
                  />
                )
              })}
            </div>
          </section>

          {/* Supporting Indicators */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Supporting Indicators
                </h2>
                <p className="text-sm text-gray-500">Low impact signals (2-5% normalized weight)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {INDICATOR_WEIGHTS.filter(w => w.weight >= 0.02 && w.weight < 0.05).map(weight => {
                const indicator = indicators.get(weight.id)
                if (!indicator) {
                  return (
                    <IndicatorCard
                      key={weight.id}
                      name={weight.name}
                      value="Loading..."
                      signal="neutral"
                      weight={weight.weight}
                      confidence={0}
                      description={weight.description}
                      dataSource={weight.dataSource}
                      isLive={weight.isLive}
                    />
                  )
                }
                return (
                  <IndicatorCard
                    key={weight.id}
                    name={weight.name}
                    value={indicator.value}
                    signal={indicator.signal}
                    weight={weight.weight}
                    confidence={indicator.confidence}
                    description={weight.description}
                    lastUpdate={new Date()}
                    dataSource={weight.dataSource}
                    isLive={weight.isLive}
                  />
                )
              })}
            </div>
          </section>

          {/* Minor Indicators */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Minor Indicators
                </h2>
                <p className="text-sm text-gray-500">Supplementary signals (&lt;2% normalized weight)</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {INDICATOR_WEIGHTS.filter(w => w.weight < 0.02).map(weight => {
                const indicator = indicators.get(weight.id)
                if (!indicator) {
                  return (
                    <IndicatorCard
                      key={weight.id}
                      name={weight.name}
                      value="Loading..."
                      signal="neutral"
                      weight={weight.weight}
                      confidence={0}
                      description={weight.description}
                      dataSource={weight.dataSource}
                      isLive={weight.isLive}
                    />
                  )
                }
                return (
                  <IndicatorCard
                    key={weight.id}
                    name={weight.name}
                    value={indicator.value}
                    signal={indicator.signal}
                    weight={weight.weight}
                    confidence={indicator.confidence}
                    description={weight.description}
                    lastUpdate={new Date()}
                    dataSource={weight.dataSource}
                    isLive={weight.isLive}
                  />
                )
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Data refreshes automatically every 60 seconds
          </p>
        </div>
      </div>
    </div>
  )
}