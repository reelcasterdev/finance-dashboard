"use client"

import { useState, useEffect } from 'react'
import { CompositeScore } from '@/components/dashboard/composite-score'
import { MarketOverview } from '@/components/dashboard/market-overview'
import { IndicatorCard } from '@/components/indicators/indicator-card'
import { calculateCompositeScore } from '@/lib/indicators/composite'
import { INDICATOR_WEIGHTS } from '@/lib/indicators/weights'
import { useAllIndicators } from '@/lib/hooks/use-indicators'
import { useEnhancedIndicators } from '@/lib/hooks/use-enhanced-indicators'
import { RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const basicIndicators = useAllIndicators()
  const enhancedIndicators = useEnhancedIndicators()
  
  // Merge indicators from both sources
  const indicators = new Map([
    ...basicIndicators.indicators,
    ...enhancedIndicators.indicators,
  ])
  
  const isLoading = basicIndicators.isLoading || enhancedIndicators.isLoading
  const error = basicIndicators.error || enhancedIndicators.error
  
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
    <div className="min-h-screen bg-discord-bg-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-discord-text-primary">
            Bitcoin Peak Indicator Dashboard
          </h1>
          <p className="text-discord-text-secondary">
            Multi-indicator analysis for Bitcoin cycle peak detection
          </p>
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