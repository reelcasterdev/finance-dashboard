'use client'

import { useState } from 'react'
import { 
  TrendingUp, Minus, ChevronDown,
  BookOpen, Calculator, Target, Activity,
  AlertCircle, BarChart3, DollarSign, Zap, Shield,
  Bitcoin, Globe, Users, Database, Brain, Gauge,
  ArrowUpRight, ArrowDownRight, Info
} from 'lucide-react'
import { INDICATOR_EXPLANATIONS, getBeginnerInterpretation, getSimplifiedState } from '@/lib/education/indicator-explanations'
import { useEducationStore } from '@/lib/stores/education-store'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Indicator {
  id: string
  name: string
  value: number | string
  signal: string | 'bullish' | 'bearish' | 'neutral'
  confidence: number
  [key: string]: unknown
}

interface ModernIndicatorCardProps {
  indicator: Indicator
  weight: number
  loading?: boolean
  name?: string
  description?: string
  dataSource?: string
  isLive?: boolean
}

// Icon mapping for different indicators
const INDICATOR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'pi-cycle': Activity,
  'mvrv': DollarSign,
  's2f': Database,
  'fear-greed': Brain,
  'lth-supply': Shield,
  'puell': Bitcoin,
  'etf-flows': Users,
  'nvt': Gauge,
  'exchange-reserves': Database,
  'nupl': BarChart3,
  'ath-distance': Target,
  'mpi': Bitcoin,
  'rhodl': Activity,
  'market-depth': BarChart3,
  'volume-trend': Activity,
  'reserve-risk': AlertCircle,
  'btc-dominance': Globe,
  'momentum-30d': TrendingUp,
  'funding-rates': DollarSign,
  'coinbase-premium': Globe,
  'fee-pressure': Zap,
  'network-congestion': Activity,
  'rainbow': BarChart3,
  'miner-revenue': Bitcoin,
  'hash-ribbons': Shield,
  'difficulty-adjustment': Database,
  'lightning-network': Zap
}

// Background gradient colors based on signal
const SIGNAL_BG_GRADIENTS = {
  bullish: 'from-green-50 to-emerald-50',
  bearish: 'from-red-50 to-rose-50',
  neutral: 'from-gray-50 to-gray-100'
}

export function ModernIndicatorCard({ 
  indicator, 
  weight, 
  loading = false,
  name,
  description,
  dataSource,
  isLive = true
}: ModernIndicatorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { isBeginnerMode } = useEducationStore()
  const explanation = INDICATOR_EXPLANATIONS[indicator.id]
  
  // Get the proper display name
  const displayName = name || explanation?.name || indicator.name
  const beginnerDisplayName = explanation?.beginnerName || displayName
  
  if (loading) {
    return (
      <div className="relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 opacity-30" />
        <div className="relative p-5 animate-pulse">
          <div className="flex items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-300 rounded-xl"></div>
              <div>
                <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
          <div className="h-10 bg-gray-300 rounded w-24 mb-3"></div>
          <div className="flex gap-2 mb-3">
            <div className="h-8 bg-gray-300 rounded-lg w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full w-full"></div>
        </div>
      </div>
    )
  }
  
  const numericValue = typeof indicator.value === 'number' ? indicator.value : 50
  
  // Normalize signal to expected values
  const normalizedSignal = (indicator.signal === 'bullish' || indicator.signal === 'buy' || indicator.signal === 'strong-buy') ? 'bullish' :
                          (indicator.signal === 'bearish' || indicator.signal === 'sell' || indicator.signal === 'strong-sell') ? 'bearish' :
                          'neutral'
  
  const simplifiedState = getSimplifiedState(numericValue, normalizedSignal)
  const interpretation = getBeginnerInterpretation(indicator.id, numericValue, normalizedSignal)
  
  const Icon = INDICATOR_ICONS[indicator.id] || BarChart3
  
  const getTrendIcon = () => {
    if (normalizedSignal === 'bullish') return <ArrowUpRight className="w-4 h-4 text-current" />
    if (normalizedSignal === 'bearish') return <ArrowDownRight className="w-4 h-4 text-current" />
    return <Minus className="w-4 h-4 text-current" />
  }
  
  const getSignalText = () => {
    if (normalizedSignal === 'bullish') return 'Bullish'
    if (normalizedSignal === 'bearish') return 'Bearish'
    return 'Neutral'
  }
  
  // Calculate percentage change (mock data for now)
  const changePercent = normalizedSignal === 'bullish' ? '+12.5%' : 
                        normalizedSignal === 'bearish' ? '-8.3%' : '+0.2%'
  
  return (
    <TooltipProvider>
      <div className={cn(
        "relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden",
        "hover:shadow-xl hover:scale-[1.02] transition-all duration-300",
        "group"
      )}>
        {/* Gradient Background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-5",
          SIGNAL_BG_GRADIENTS[normalizedSignal]
        )} />
        
        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-700">Live</span>
            </div>
          </div>
        )}
        
        {/* Main Card Content */}
        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl shadow-lg",
                normalizedSignal === 'bullish' ? "bg-gradient-to-br from-green-500 to-emerald-600" :
                normalizedSignal === 'bearish' ? "bg-gradient-to-br from-red-500 to-rose-600" :
                "bg-gradient-to-br from-gray-400 to-gray-600"
              )}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    {isBeginnerMode ? beginnerDisplayName : displayName}
                  </h3>
                  {explanation && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">{explanation.whatItMeans}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                {description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{description}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Value Section */}
          <div className="mb-4">
            <div className="flex items-baseline gap-3">
              {isBeginnerMode ? (
                <>
                  <div className="text-3xl font-bold text-gray-900">{simplifiedState}</div>
                  <div className="text-sm text-gray-500">
                    ({typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value})
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900">
                    {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value}
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    normalizedSignal === 'bullish' ? "text-green-600" :
                    normalizedSignal === 'bearish' ? "text-red-600" : "text-gray-600"
                  )}>
                    <span className="flex items-center">
                      {getTrendIcon()}
                    </span>
                    <span>{changePercent}</span>
                  </div>
                </>
              )}
            </div>
            
            {/* Signal Badge */}
            <div className="flex items-center gap-2 mt-2">
              <div className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm",
                normalizedSignal === 'bullish' ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" :
                normalizedSignal === 'bearish' ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" :
                "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
              )}>
                {getTrendIcon()}
                <span>{getSignalText()}</span>
              </div>
              {dataSource && (
                <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                  {dataSource}
                </div>
              )}
            </div>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Confidence */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Confidence</span>
                <span className="text-xs font-semibold text-gray-900">{indicator.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={cn(
                    "h-1.5 rounded-full transition-all bg-gradient-to-r",
                    indicator.confidence > 70 ? "from-green-400 to-green-600" : 
                    indicator.confidence > 40 ? "from-yellow-400 to-yellow-600" : 
                    "from-red-400 to-red-600"
                  )}
                  style={{ width: `${indicator.confidence}%` }}
                />
              </div>
            </div>
            
            {/* Weight */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Weight</span>
                <span className="text-xs font-semibold text-gray-900">{(weight * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                  style={{ width: `${Math.min(weight * 100 * 3, 100)}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Beginner Mode Interpretation */}
          {isBeginnerMode && explanation && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-900 font-medium">{interpretation}</p>
            </div>
          )}
          
          {/* Sparkline Placeholder */}
          <div className="mt-3 h-12 bg-gray-50 rounded-lg flex items-center justify-center p-2">
            <div className="flex items-center gap-1 h-full">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full",
                    normalizedSignal === 'bullish' ? "bg-green-400" :
                    normalizedSignal === 'bearish' ? "bg-red-400" :
                    "bg-gray-400"
                  )}
                  style={{
                    height: `${Math.random() * 20 + 10}px`,
                    opacity: 0.4 + (i / 12) * 0.6
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Expand Button */}
          {explanation && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Learn More</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-180")} />
            </button>
          )}
        </div>
        
        {/* Expanded Educational Content */}
        {isExpanded && explanation && (
          <div className="px-5 pb-5 pt-0 space-y-3 border-t border-gray-100 bg-gray-50">
            <div className="pt-3 grid grid-cols-1 gap-3">
              <div className="bg-white rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  How to Read
                </h4>
                <p className="text-xs text-gray-600">{explanation.howToRead}</p>
              </div>
              
              <div className="bg-white rounded-lg p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  When to Use
                </h4>
                <p className="text-xs text-gray-600">{explanation.whenToUse}</p>
              </div>
              
              {explanation.formula && (
                <div className="bg-white rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5" />
                    Formula
                  </h4>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 block">
                    {explanation.formula}
                  </code>
                </div>
              )}
              
              {explanation.proTip && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-yellow-800 mb-1 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Pro Tip
                  </h4>
                  <p className="text-xs text-yellow-700">{explanation.proTip}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}