"use client"

import { useState, useEffect } from 'react'
import { CompositeScore } from '@/components/dashboard/composite-score'
import { MarketOverview } from '@/components/dashboard/market-overview'
import { IndicatorCard } from '@/components/indicators/indicator-card'
import { Badge } from '@/components/ui/badge'
import { calculateCompositeScore } from '@/lib/indicators/composite'
import { INDICATOR_WEIGHTS } from '@/lib/indicators/weights'
import { useAllIndicators } from '@/lib/hooks/use-indicators'
import { useEnhancedIndicators } from '@/lib/hooks/use-enhanced-indicators'
import { useNetworkIndicators } from '@/lib/hooks/use-network-indicators'
import { RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const basicIndicators = useAllIndicators()
  const enhancedIndicators = useEnhancedIndicators()
  const networkIndicators = useNetworkIndicators()
  
  // Merge indicators from all sources
  const indicators = new Map([
    ...basicIndicators.indicators,
    ...enhancedIndicators.indicators,
    ...networkIndicators.indicators,
  ])
  
  const isLoading = basicIndicators.isLoading || enhancedIndicators.isLoading || networkIndicators.isLoading
  const error = basicIndicators.error || enhancedIndicators.error || networkIndicators.error
  
  const [compositeScore, setCompositeScore] = useState({
    overall: 50,
    signal: 'neutral' as const,
    peakProbability: 50,
    weightedScores: [],
    lastUpdate: new Date(),
  })

  useEffect(() => {
    if (indicators.size > 0) {
      const score = calculateCompositeScore(indicators)
      setCompositeScore(score)
    }
  }, [indicators])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-discord-bg-primary p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-discord-text-secondary">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              Loading indicators...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2 py-8">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-discord-blurple via-discord-fuchsia to-discord-blurple animate-pulse">
            Bitcoin Peak Indicator Dashboard
          </h1>
          <p className="text-discord-text-secondary text-lg">
            Multi-indicator analysis for Bitcoin cycle peak detection
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Badge className="bg-discord-green/20 text-discord-green border border-discord-green/30">
              <div className="w-2 h-2 rounded-full bg-discord-green animate-pulse mr-1" />
              Live Data
            </Badge>
            <Badge className="bg-discord-blurple/20 text-discord-blurple border border-discord-blurple/30">
              15 Indicators
            </Badge>
            <Badge className="bg-discord-fuchsia/20 text-discord-fuchsia border border-discord-fuchsia/30">
              Auto Refresh
            </Badge>
          </div>
        </div>

        {/* Market Overview */}
        <MarketOverview bitcoinData={enhancedIndicators.bitcoinData} />

        {/* Composite Score */}
        <div className="flex justify-center">
          <CompositeScore
            score={compositeScore.overall}
            signal={compositeScore.signal}
            peakProbability={compositeScore.peakProbability}
            lastUpdate={compositeScore.lastUpdate}
          />
        </div>

        {/* Indicators Grid */}
        <div className="space-y-6">
          {/* High Weight Indicators (30-20%) */}
          <div>
            <h2 className="text-xl font-semibold text-discord-text-primary mb-4">
              Primary Indicators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INDICATOR_WEIGHTS.filter(w => w.weight >= 0.20).map(weight => {
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
          </div>

          {/* Medium Weight Indicators (18-10%) */}
          <div>
            <h2 className="text-xl font-semibold text-discord-text-primary mb-4">
              Secondary Indicators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {INDICATOR_WEIGHTS.filter(w => w.weight >= 0.10 && w.weight < 0.20).map(weight => {
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
          </div>

          {/* Supporting Indicators (12-5%) */}
          <div>
            <h2 className="text-xl font-semibold text-discord-text-primary mb-4">
              Supporting Indicators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          </div>

          {/* Minor Indicators (6-3%) */}
          <div>
            <h2 className="text-xl font-semibold text-discord-text-primary mb-4">
              Minor Indicators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {INDICATOR_WEIGHTS.filter(w => w.weight < 0.05).map(weight => {
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
          </div>
        </div>
      </div>
    </div>
  )
}