"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Clock, Activity, Zap, BarChart2 } from "lucide-react"
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
  const getSignalColor = () => {
    switch (signal) {
      case 'buy':
        return 'bg-discord-green text-discord-bg-tertiary'
      case 'sell':
        return 'bg-discord-red text-white'
      default:
        return 'bg-discord-yellow text-discord-bg-tertiary'
    }
  }

  const getCardBorder = () => {
    switch (signal) {
      case 'buy':
        return 'border-discord-green/30'
      case 'sell':
        return 'border-discord-red/30'
      default:
        return 'border-discord-yellow/30'
    }
  }

  const getSignalIcon = () => {
    switch (signal) {
      case 'buy':
        return <TrendingDown className="w-4 h-4" />
      case 'sell':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Minus className="w-4 h-4" />
    }
  }

  const getProgressColor = () => {
    if (confidence >= 80) return 'bg-discord-green'
    if (confidence >= 60) return 'bg-discord-yellow'
    if (confidence >= 40) return 'bg-discord-fuchsia'
    return 'bg-discord-red'
  }

  const getValueColor = () => {
    switch (signal) {
      case 'buy':
        return 'text-discord-green'
      case 'sell':
        return 'text-discord-red'
      default:
        return 'text-discord-yellow'
    }
  }

  // Generate mock trend data if not provided
  const trendData = trend.length > 0 ? trend : Array.from({ length: 20 }, () => Math.random() * 100)

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] border-2",
      getCardBorder()
    )}>
      {/* Background accent */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        signal === 'buy' ? 'bg-discord-green' : 
        signal === 'sell' ? 'bg-discord-red' : 
        'bg-discord-yellow'
      )} />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className={cn(
              "p-1.5 rounded-lg",
              signal === 'buy' ? 'bg-discord-green/20' : 
              signal === 'sell' ? 'bg-discord-red/20' : 
              'bg-discord-yellow/20'
            )}>
              <Activity className={cn(
                "w-4 h-4",
                signal === 'buy' ? 'text-discord-green' : 
                signal === 'sell' ? 'text-discord-red' : 
                'text-discord-yellow'
              )} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-discord-text-primary text-sm font-semibold">
                {name}
              </CardTitle>
              {dataSource && (
                <div className="flex items-center gap-1 mt-1">
                  <Badge 
                    variant="outline"
                    className={cn(
                      "text-xs px-1.5 py-0",
                      isLive ? "border-discord-green/50 text-discord-green" : "border-discord-yellow/50 text-discord-yellow"
                    )}
                  >
                    {isLive && <div className="w-1.5 h-1.5 rounded-full bg-discord-green animate-pulse mr-1" />}
                    {dataSource}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <Badge 
            className="bg-discord-blurple text-white border-0 font-bold px-2 py-0.5"
          >
            {(weight * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className={cn("text-3xl font-bold", getValueColor())}>
            {typeof value === 'number' ? value.toFixed(2) : value}
          </div>
          <Badge className={cn("flex items-center gap-1 shadow-lg", getSignalColor())}>
            {getSignalIcon()}
            {signal.toUpperCase()}
          </Badge>
        </div>

        {description && (
          <p className="text-xs text-discord-text-secondary bg-discord-bg-tertiary/50 rounded p-2">
            {description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-discord-text-secondary">Confidence</span>
            <span className="text-discord-text-primary font-semibold">{confidence}%</span>
          </div>
          <Progress 
            value={confidence} 
            className="h-2 bg-discord-bg-tertiary"
            indicatorColor={getProgressColor()}
          />
        </div>

        {/* Trend Chart */}
        <div className="pt-2">
          <div className="flex justify-between text-xs text-discord-text-secondary mb-1">
            <span>Trend</span>
            <span>Last 20</span>
          </div>
          <div className="h-12 flex items-end gap-0.5 bg-discord-bg-tertiary/30 rounded p-1">
            {trendData.slice(-20).map((val, idx) => {
              const height = (val / Math.max(...trendData)) * 100
              const isLast = idx === trendData.length - 1
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex-1 rounded-t transition-all hover:opacity-80",
                    signal === 'buy' ? 'bg-discord-green/50' : 
                    signal === 'sell' ? 'bg-discord-red/50' : 
                    'bg-discord-yellow/50',
                    isLast && 'animate-pulse'
                  )}
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>
        </div>

        {lastUpdate && (
          <div className="flex items-center gap-1 text-xs text-discord-text-secondary">
            <Clock className="w-3 h-3" />
            {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}