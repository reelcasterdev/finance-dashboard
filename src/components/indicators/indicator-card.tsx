"use client"

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Clock, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface IndicatorCardProps {
  name: string
  value: number | string
  signal: 'buy' | 'neutral' | 'sell'
  weight: number
  confidence: number
  description?: string
  lastUpdate?: Date
  trend?: number[]
  dataSource?: string
  isLive?: boolean
}

export function IndicatorCard({
  name,
  value,
  signal,
  weight,
  confidence,
  description,
  lastUpdate,
  trend = [],
  dataSource,
  isLive = false
}: IndicatorCardProps) {
  const getSignalVariant = () => {
    switch (signal) {
      case 'buy':
        return 'success'
      case 'sell':
        return 'destructive'
      default:
        return 'warning'
    }
  }

  const getSignalIcon = () => {
    switch (signal) {
      case 'buy':
        return <ArrowDown className="w-3 h-3" />
      case 'sell':
        return <ArrowUp className="w-3 h-3" />
      default:
        return <Minus className="w-3 h-3" />
    }
  }

  const getValueColor = () => {
    switch (signal) {
      case 'buy':
        return 'text-green-600'
      case 'sell':
        return 'text-red-600'
      default:
        return 'text-amber-600'
    }
  }

  const getAccentColor = () => {
    switch (signal) {
      case 'buy':
        return 'from-green-500/10 to-transparent'
      case 'sell':
        return 'from-red-500/10 to-transparent'
      default:
        return 'from-amber-500/10 to-transparent'
    }
  }

  // Memoize trend data to prevent flickering
  const trendData = useMemo(() => {
    if (trend && trend.length > 0) return trend
    // Generate stable mock data based on indicator name (for consistency)
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return Array.from({ length: 20 }, (_, i) => 
      50 + Math.sin((i + seed) * 0.5) * 20 + Math.cos((i + seed) * 0.3) * 10
    )
  }, [trend, name])

  const trendDirection = useMemo(() => {
    if (trendData.length >= 2) {
      return trendData[trendData.length - 1] > trendData[trendData.length - 2] ? 'up' : 'down'
    }
    return 'neutral'
  }, [trendData])

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Subtle gradient accent */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-30",
        getAccentColor()
      )} />
      
      <CardHeader className="pb-2 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium text-gray-900">
                {name}
              </CardTitle>
              {isLive && (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
              )}
            </div>
            {dataSource && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {dataSource}
                </Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {(weight * 100).toFixed(0)}% weight
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 relative">
        <div className="flex items-end justify-between">
          <div>
            <div className={cn("text-2xl font-bold", getValueColor())}>
              {typeof value === 'number' ? value.toFixed(2) : value}
            </div>
            {trendDirection !== 'neutral' && (
              <div className="flex items-center gap-1 mt-1">
                {trendDirection === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {trendDirection === 'up' ? '+' : '-'}
                  {Math.abs(((trendData[trendData.length - 1] - trendData[trendData.length - 2]) / trendData[trendData.length - 2]) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <Badge variant={getSignalVariant() as "default" | "destructive" | "outline" | "secondary"} className="flex items-center gap-1">
            {getSignalIcon()}
            <span className="uppercase text-[10px] font-semibold">{signal}</span>
          </Badge>
        </div>

        {/* Mini Sparkline Chart */}
        <div className="h-8 flex items-end gap-[1px]">
          {useMemo(() => {
            const maxValue = Math.max(...trendData)
            const minValue = Math.min(...trendData)
            const range = maxValue - minValue || 1
            
            return trendData.slice(-20).map((val, idx) => {
              const height = ((val - minValue) / range) * 100
              const isRecent = idx >= 17 // Last 3 bars
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex-1 rounded-t transition-all",
                    signal === 'buy' 
                      ? isRecent ? 'bg-green-400' : 'bg-green-200' 
                      : signal === 'sell' 
                      ? isRecent ? 'bg-red-400' : 'bg-red-200'
                      : isRecent ? 'bg-amber-400' : 'bg-amber-200',
                    "hover:opacity-80"
                  )}
                  style={{ height: `${Math.max(height, 5)}%` }}
                />
              )
            })
          }, [trendData, signal])}
        </div>

        {/* Confidence Meter */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Confidence</span>
            <span className="text-xs font-semibold text-gray-700">{confidence.toFixed(3)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                confidence >= 80 ? 'bg-green-500' :
                confidence >= 60 ? 'bg-blue-500' :
                confidence >= 40 ? 'bg-amber-500' :
                'bg-red-500'
              )}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {description && (
          <p className="text-xs text-gray-600 bg-gray-50 rounded-md p-2 line-clamp-2">
            {description}
          </p>
        )}

        {lastUpdate && (
          <div className="flex items-center gap-1 text-xs text-gray-400 pt-1 border-t border-gray-100">
            <Clock className="w-3 h-3" />
            <span>{new Date(lastUpdate).toLocaleTimeString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}