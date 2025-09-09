'use client'

import { useState } from 'react'
import { 
  TrendingUp, TrendingDown, Minus, ChevronDown,
  HelpCircle, BookOpen, Calculator, Target
} from 'lucide-react'
interface Indicator {
  id: string
  name: string
  value: number | string
  signal: 'bullish' | 'bearish' | 'neutral'
  confidence: number
}
import { INDICATOR_EXPLANATIONS, getBeginnerInterpretation, getSimplifiedState } from '@/lib/education/indicator-explanations'
import { useEducationStore } from '@/lib/stores/education-store'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface EducationalIndicatorCardProps {
  indicator: Indicator
  weight: number
  loading?: boolean
}

export function EducationalIndicatorCard({ indicator, weight, loading = false }: EducationalIndicatorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { isBeginnerMode } = useEducationStore()
  const explanation = INDICATOR_EXPLANATIONS[indicator.id]
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
      </div>
    )
  }
  
  const getTrendIcon = () => {
    if (indicator.signal === 'bullish') return <TrendingUp className="w-4 h-4 text-green-500" />
    if (indicator.signal === 'bearish') return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }
  
  const getSignalColor = () => {
    if (indicator.signal === 'bullish') return 'text-green-600 bg-green-50'
    if (indicator.signal === 'bearish') return 'text-red-600 bg-red-50'
    return 'text-gray-600 bg-gray-50'
  }
  
  const numericValue = typeof indicator.value === 'number' ? indicator.value : 50
  const simplifiedState = getSimplifiedState(numericValue, indicator.signal)
  const interpretation = getBeginnerInterpretation(indicator.id, numericValue, indicator.signal)
  
  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all">
        {/* Main Card Content */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-700">
                {isBeginnerMode && explanation ? explanation.beginnerName : indicator.name}
              </h3>
              {explanation && (
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">{explanation.whatItMeans}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1", getSignalColor())}>
              {getTrendIcon()}
              <span className="capitalize">{indicator.signal}</span>
            </div>
          </div>
          
          {/* Value Display */}
          <div className="mb-3">
            {isBeginnerMode ? (
              <div>
                <div className="text-2xl font-bold text-gray-900">{simplifiedState}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Actual: {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value}
                </div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : indicator.value}
              </div>
            )}
          </div>
          
          {/* Confidence Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Confidence</span>
              <span className="font-medium text-gray-700">{indicator.confidence}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  indicator.confidence > 70 ? "bg-green-500" : 
                  indicator.confidence > 40 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${indicator.confidence}%` }}
              />
            </div>
          </div>
          
          {/* Weight Display */}
          <div className="mt-2 text-xs text-gray-500">
            Weight: {(weight * 100).toFixed(1)}%
          </div>
          
          {/* Beginner Mode Interpretation */}
          {isBeginnerMode && explanation && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">{interpretation}</p>
            </div>
          )}
          
          {/* Expand Button */}
          {explanation && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Learn More
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isExpanded && "rotate-180")} />
            </button>
          )}
        </div>
        
        {/* Expanded Educational Content */}
        {isExpanded && explanation && (
          <div className="px-4 pb-4 pt-0 space-y-3 border-t border-gray-100">
            <div className="pt-3">
              <h4 className="text-xs font-semibold text-gray-600 mb-1">How to Read</h4>
              <p className="text-xs text-gray-600">{explanation.howToRead}</p>
            </div>
            
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-1">When to Use</h4>
              <p className="text-xs text-gray-600">{explanation.whenToUse}</p>
            </div>
            
            {explanation.formula && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                  <Calculator className="w-3 h-3" />
                  Formula
                </h4>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 block">
                  {explanation.formula}
                </code>
              </div>
            )}
            
            {explanation.example && (
              <div>
                <h4 className="text-xs font-semibold text-gray-600 mb-1">Example</h4>
                <p className="text-xs text-gray-600">{explanation.example}</p>
              </div>
            )}
            
            {explanation.proTip && (
              <div className="p-2 bg-yellow-50 rounded">
                <h4 className="text-xs font-semibold text-yellow-800 mb-1 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Pro Tip
                </h4>
                <p className="text-xs text-yellow-700">{explanation.proTip}</p>
              </div>
            )}
            
            {explanation.accuracy && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Historical Accuracy:</span> {explanation.accuracy}
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}