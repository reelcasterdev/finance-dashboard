'use client'

import { useState } from 'react'
import { ChevronDown, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Wallet } from 'lucide-react'
import { MARKET_CYCLE_PHASES, getCurrentMarketPhase } from '@/lib/education/indicator-explanations'
import { cn } from '@/lib/utils'

interface CycleProgressProps {
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

const PHASE_ICONS = {
  'Accumulation': Wallet,
  'Early Bull': TrendingUp,
  'Late Bull': DollarSign,
  'Distribution': AlertTriangle,
  'Bear Market': TrendingDown
}

const PHASE_COLORS = {
  'Accumulation': 'bg-green-500',
  'Early Bull': 'bg-blue-500',
  'Late Bull': 'bg-yellow-500',
  'Distribution': 'bg-orange-500',
  'Bear Market': 'bg-red-500'
}

export function CycleProgress({ indicators }: CycleProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const currentPhase = getCurrentMarketPhase(indicators)
  const currentPhaseIndex = MARKET_CYCLE_PHASES.findIndex(p => p.name === currentPhase.name)
  const progress = ((currentPhaseIndex + 0.5) / MARKET_CYCLE_PHASES.length) * 100
  
  const Icon = PHASE_ICONS[currentPhase.name as keyof typeof PHASE_ICONS] || TrendingUp
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            PHASE_COLORS[currentPhase.name as keyof typeof PHASE_COLORS],
            "bg-opacity-10"
          )}>
            <Icon className={cn(
              "w-5 h-5",
              PHASE_COLORS[currentPhase.name as keyof typeof PHASE_COLORS].replace('bg-', 'text-')
            )} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-medium text-gray-500">Market Cycle Phase</h3>
            <p className="text-lg font-semibold text-gray-900">{currentPhase.name}</p>
          </div>
        </div>
        <ChevronDown className={cn(
          "w-5 h-5 text-gray-400 transition-transform",
          isExpanded && "rotate-180"
        )} />
      </button>
      
      {/* Progress Bar */}
      <div className="px-6 pb-4">
        <div className="relative">
          {/* Background track */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full flex">
              {MARKET_CYCLE_PHASES.map((phase, index) => (
                <div
                  key={phase.name}
                  className={cn(
                    "flex-1 border-r border-white last:border-0",
                    index <= currentPhaseIndex
                      ? PHASE_COLORS[phase.name as keyof typeof PHASE_COLORS]
                      : 'bg-gray-200'
                  )}
                />
              ))}
            </div>
          </div>
          
          {/* Current position indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500"
            style={{ left: `${progress}%` }}
          >
            <div className="relative">
              <div className="w-4 h-4 bg-white border-2 border-gray-900 rounded-full shadow-lg" />
              <div className="absolute inset-0 w-4 h-4 bg-white border-2 border-gray-900 rounded-full animate-ping" />
            </div>
          </div>
        </div>
        
        {/* Phase labels */}
        <div className="flex justify-between mt-2">
          {MARKET_CYCLE_PHASES.map((phase) => (
            <div key={phase.name} className="flex-1 text-center">
              <span className={cn(
                "text-xs",
                phase.name === currentPhase.name
                  ? "font-semibold text-gray-900"
                  : "text-gray-400"
              )}>
                {phase.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
          <div className="pt-4">
            <p className="text-sm text-gray-600">{currentPhase.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Characteristics */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Characteristics</h4>
              <ul className="space-y-1">
                {currentPhase.characteristics.slice(0, 3).map((char, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-1">
                    <span className="text-gray-400 mt-1">•</span>
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* What to Do */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Recommended Actions</h4>
              <ul className="space-y-1">
                {currentPhase.whatToDo.map((action, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-1">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Key Indicators */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Watch These Signals</h4>
              <ul className="space-y-1">
                {currentPhase.indicators.map((indicator, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-1">
                    <span className="text-blue-500 mt-1">📊</span>
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Typical Duration:</span> {currentPhase.typicalDuration}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}