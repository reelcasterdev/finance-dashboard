"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertTriangle, Activity, BarChart3, Info } from "lucide-react"

interface CompositeScoreProps {
  score: number
  signal: 'strong-buy' | 'buy' | 'neutral' | 'sell' | 'strong-sell'
  peakProbability: number
  lastUpdate: Date
}

export function CompositeScore({
  score,
  signal,
  peakProbability,
  lastUpdate
}: CompositeScoreProps) {
  const getSignalVariant = () => {
    switch (signal) {
      case 'strong-buy':
      case 'buy':
        return 'success'
      case 'neutral':
        return 'warning'
      case 'sell':
      case 'strong-sell':
        return 'destructive'
    }
  }

  const getSignalText = () => {
    switch (signal) {
      case 'strong-buy':
        return 'STRONG BUY'
      case 'buy':
        return 'BUY'
      case 'neutral':
        return 'NEUTRAL'
      case 'sell':
        return 'SELL'
      case 'strong-sell':
        return 'STRONG SELL'
    }
  }

  const getSignalDescription = () => {
    switch (signal) {
      case 'strong-buy':
        return 'Extreme accumulation opportunity'
      case 'buy':
        return 'Good entry point for positions'
      case 'neutral':
        return 'Market indecision, wait for clarity'
      case 'sell':
        return 'Consider taking profits'
      case 'strong-sell':
        return 'Peak zone, high risk'
    }
  }

  const rotation = (score / 100) * 180 - 90

  const getScoreColor = () => {
    if (score <= 20) return 'text-green-600'
    if (score <= 35) return 'text-green-500'
    if (score <= 50) return 'text-blue-500'
    if (score <= 65) return 'text-amber-500'
    if (score <= 80) return 'text-orange-500'
    return 'text-red-600'
  }

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Bitcoin Cycle Composite Score
          </CardTitle>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Modern Gauge */}
        <div className="relative">
          <div className="relative w-72 h-36 mx-auto">
            {/* SVG Gauge */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
              <defs>
                <linearGradient id="modernGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="25%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="75%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              
              {/* Background arc */}
              <path
                d="M 20 80 A 60 60 0 0 1 180 80"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="16"
                strokeLinecap="round"
              />
              
              {/* Colored arc */}
              <path
                d="M 20 80 A 60 60 0 0 1 180 80"
                fill="none"
                stroke="url(#modernGaugeGradient)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${score * 1.88} 188`}
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Tick marks */}
              {[0, 25, 50, 75, 100].map((tick) => {
                const angle = (tick / 100) * 180 - 90
                const x1 = 100 + 55 * Math.cos(angle * Math.PI / 180)
                const y1 = 80 + 55 * Math.sin(angle * Math.PI / 180)
                const x2 = 100 + 45 * Math.cos(angle * Math.PI / 180)
                const y2 = 80 + 45 * Math.sin(angle * Math.PI / 180)
                return (
                  <line
                    key={tick}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#9ca3af"
                    strokeWidth="2"
                  />
                )
              })}
            </svg>
            
            {/* Needle */}
            <div 
              className="absolute bottom-0 left-1/2 w-0.5 h-20 bg-gray-800 origin-bottom"
              style={{
                transform: `translateX(-50%) rotate(${rotation}deg)`,
                transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
              }}
            >
              <div className="absolute -top-1 -left-[7px] w-4 h-4 bg-white rounded-full border-2 border-gray-800" />
            </div>
            
            {/* Center dot */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 rounded-full" />
          </div>

          {/* Score Labels */}
          <div className="flex justify-between px-8 -mt-2">
            <span className="text-xs text-gray-500">0</span>
            <span className="text-xs text-gray-500">25</span>
            <span className="text-xs text-gray-500">50</span>
            <span className="text-xs text-gray-500">75</span>
            <span className="text-xs text-gray-500">100</span>
          </div>
        </div>

        {/* Score Display */}
        <div className="text-center space-y-3">
          <div className={cn("text-6xl font-bold", getScoreColor())}>
            {score.toFixed(0)}
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Badge variant={getSignalVariant() as "default" | "destructive" | "outline" | "secondary"} className="text-sm px-3 py-1">
              {getSignalText()}
            </Badge>
          </div>

          <p className="text-sm text-gray-600">
            {getSignalDescription()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <BarChart3 className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Peak Probability</span>
            </div>
            <div className={cn(
              "text-2xl font-bold",
              peakProbability > 75 ? 'text-red-600' :
              peakProbability > 50 ? 'text-amber-600' :
              'text-green-600'
            )}>
              {peakProbability.toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Last Update</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Risk Alert */}
        {peakProbability > 75 && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                High Risk Alert
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Market indicators suggest elevated risk levels. Consider position management.
              </p>
            </div>
          </div>
        )}

        {peakProbability < 25 && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Info className="w-4 h-4 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Opportunity Zone
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Market indicators suggest potential accumulation opportunity.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}