'use client'

import { AlertCircle, TrendingUp, TrendingDown, Shield, DollarSign, BookOpen } from 'lucide-react'
import { CompositeScore as CompositeScoreType } from '@/lib/indicators/composite'
import { getCurrentMarketPhase } from '@/lib/education/indicator-explanations'
import { cn } from '@/lib/utils'

interface ActionRecommendationsProps {
  compositeScore: CompositeScoreType
  indicators: Map<string, {
    id: string
    name: string
    value: number | string
    signal: string | 'bullish' | 'bearish' | 'neutral'
    confidence: number
    weight?: number
    [key: string]: unknown
  }>
}

export function ActionRecommendations({ compositeScore, indicators }: ActionRecommendationsProps) {
  const phase = getCurrentMarketPhase(indicators)
  const fearGreedValue = indicators.get('fear-greed')?.value || 50
  const fearGreed = typeof fearGreedValue === 'number' ? fearGreedValue : 50
  const mvrvValue = indicators.get('mvrv')?.value || 1
  const mvrv = typeof mvrvValue === 'number' ? mvrvValue : 1
  
  // Determine market condition
  const getMarketCondition = () => {
    if ((compositeScore.signal === 'buy' || compositeScore.signal === 'strong-buy') && compositeScore.overall < 30) {
      return {
        status: 'Strong Opportunity',
        color: 'green',
        icon: TrendingUp,
        emoji: '🟢'
      }
    } else if (compositeScore.signal === 'buy' || compositeScore.signal === 'strong-buy') {
      return {
        status: 'Accumulation Zone',
        color: 'blue',
        icon: DollarSign,
        emoji: '🔵'
      }
    } else if ((compositeScore.signal === 'sell' || compositeScore.signal === 'strong-sell') && compositeScore.overall > 70) {
      return {
        status: 'High Risk',
        color: 'red',
        icon: AlertCircle,
        emoji: '🔴'
      }
    } else if (compositeScore.signal === 'sell' || compositeScore.signal === 'strong-sell') {
      return {
        status: 'Caution Advised',
        color: 'orange',
        icon: TrendingDown,
        emoji: '🟠'
      }
    } else {
      return {
        status: 'Neutral Market',
        color: 'gray',
        icon: Shield,
        emoji: '🟡'
      }
    }
  }
  
  const condition = getMarketCondition()
  const Icon = condition.icon
  
  // Generate recommendations based on conditions
  const getRecommendations = () => {
    const recs = []
    
    if (fearGreed < 25 && mvrv < 1) {
      recs.push({
        type: 'buy',
        text: 'Strong accumulation opportunity - fear is extreme and holders are in loss',
        priority: 'high'
      })
    } else if (fearGreed < 40 && (compositeScore.signal === 'buy' || compositeScore.signal === 'strong-buy')) {
      recs.push({
        type: 'buy',
        text: 'Consider increasing DCA amounts during this fear phase',
        priority: 'medium'
      })
    }
    
    if (fearGreed > 75 && mvrv > 3) {
      recs.push({
        type: 'sell',
        text: 'Consider taking profits - extreme greed and high unrealized profits',
        priority: 'high'
      })
    } else if (fearGreed > 65 && (compositeScore.signal === 'sell' || compositeScore.signal === 'strong-sell')) {
      recs.push({
        type: 'caution',
        text: 'Reduce position sizes - market showing signs of overheating',
        priority: 'medium'
      })
    }
    
    if (compositeScore.signal === 'neutral') {
      recs.push({
        type: 'hold',
        text: 'Market is balanced - stick to your regular DCA schedule',
        priority: 'low'
      })
    }
    
    // Risk warnings
    if (mvrv > 3.5) {
      recs.push({
        type: 'warning',
        text: 'Avoid using leverage - market is in high-risk territory',
        priority: 'high'
      })
    }
    
    return recs
  }
  
  const recommendations = getRecommendations()
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={cn(
        "px-6 py-4 border-b",
        condition.color === 'green' && "bg-green-50 border-green-200",
        condition.color === 'blue' && "bg-blue-50 border-blue-200",
        condition.color === 'red' && "bg-red-50 border-red-200",
        condition.color === 'orange' && "bg-orange-50 border-orange-200",
        condition.color === 'gray' && "bg-gray-50 border-gray-200"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              condition.color === 'green' && "bg-green-100",
              condition.color === 'blue' && "bg-blue-100",
              condition.color === 'red' && "bg-red-100",
              condition.color === 'orange' && "bg-orange-100",
              condition.color === 'gray' && "bg-gray-100"
            )}>
              <Icon className={cn(
                "w-5 h-5",
                condition.color === 'green' && "text-green-600",
                condition.color === 'blue' && "text-blue-600",
                condition.color === 'red' && "text-red-600",
                condition.color === 'orange' && "text-orange-600",
                condition.color === 'gray' && "text-gray-600"
              )} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {condition.emoji} {condition.status}
              </h3>
              <p className="text-sm text-gray-600">
                Current Phase: {phase.name}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {compositeScore.overall.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500 uppercase">
              Composite Score
            </div>
          </div>
        </div>
      </div>
      
      {/* What This Means */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">What This Means</h4>
        <p className="text-sm text-gray-600">
          {(compositeScore.signal === 'buy' || compositeScore.signal === 'strong-buy') && compositeScore.overall < 30 &&
            "Bitcoin appears significantly undervalued based on multiple indicators. Historical data suggests this is a prime accumulation opportunity."
          }
          {(compositeScore.signal === 'buy' || compositeScore.signal === 'strong-buy') && compositeScore.overall >= 30 &&
            "Indicators are leaning bullish but not overwhelming. Good for steady accumulation but avoid large one-time purchases."
          }
          {(compositeScore.signal === 'sell' || compositeScore.signal === 'strong-sell') && compositeScore.overall > 70 &&
            "Multiple indicators suggest Bitcoin is overvalued. Risk of correction is elevated. This is typically a distribution phase."
          }
          {(compositeScore.signal === 'sell' || compositeScore.signal === 'strong-sell') && compositeScore.overall <= 70 &&
            "Some caution signals appearing but not extreme. Consider reducing exposure or waiting for better entry points."
          }
          {compositeScore.signal === 'neutral' &&
            "Market indicators are mixed with no clear direction. This is normal consolidation. Stick to your planned strategy."
          }
        </p>
      </div>
      
      {/* Recommendations */}
      <div className="px-6 py-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Recommended Actions</h4>
        <div className="space-y-2">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-2 p-3 rounded-lg",
                  rec.type === 'buy' && "bg-green-50",
                  rec.type === 'sell' && "bg-red-50",
                  rec.type === 'hold' && "bg-blue-50",
                  rec.type === 'caution' && "bg-orange-50",
                  rec.type === 'warning' && "bg-yellow-50"
                )}
              >
                <span className="mt-0.5">
                  {rec.type === 'buy' && '✅'}
                  {rec.type === 'sell' && '💰'}
                  {rec.type === 'hold' && '⏸️'}
                  {rec.type === 'caution' && '⚠️'}
                  {rec.type === 'warning' && '🚨'}
                </span>
                <p className={cn(
                  "text-sm",
                  rec.priority === 'high' ? "font-medium text-gray-900" : "text-gray-700"
                )}>
                  {rec.text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No specific actions recommended at this time.</p>
          )}
        </div>
      </div>
      
      {/* Educational Link */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <BookOpen className="w-4 h-4" />
          Learn more about {phase.name} phase
        </button>
      </div>
    </div>
  )
}