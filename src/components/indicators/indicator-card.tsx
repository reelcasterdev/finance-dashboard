"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react"
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
}

export function IndicatorCard({
  name,
  value,
  signal,
  weight,
  confidence,
  description,
  lastUpdate,
  trend = []
}: IndicatorCardProps) {
  const getSignalColor = () => {
    switch (signal) {
      case 'buy':
        return 'bg-discord-green text-discord-bg-tertiary'
      case 'sell':
        return 'bg-discord-red text-discord-white'
      default:
        return 'bg-discord-yellow text-discord-bg-tertiary'
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

  return (
    <Card className="bg-discord-bg-secondary border-discord-border hover:shadow-discord-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-discord-text-primary text-base font-medium">
            {name}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className="bg-discord-blurple/20 text-discord-blurple border-discord-blurple/30"
          >
            {(weight * 100).toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-discord-text-primary">
            {typeof value === 'number' ? value.toFixed(2) : value}
          </div>
          <Badge className={cn("flex items-center gap-1", getSignalColor())}>
            {getSignalIcon()}
            {signal.toUpperCase()}
          </Badge>
        </div>

        {description && (
          <p className="text-xs text-discord-text-secondary">
            {description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-discord-text-secondary">Confidence</span>
            <span className="text-discord-text-primary">{confidence}%</span>
          </div>
          <Progress 
            value={confidence} 
            className="h-1.5"
            indicatorColor={getProgressColor()}
          />
        </div>

        {trend.length > 0 && (
          <div className="h-12 flex items-end gap-0.5">
            {trend.slice(-20).map((val, idx) => {
              const height = (val / Math.max(...trend)) * 100
              return (
                <div
                  key={idx}
                  className="flex-1 bg-discord-blurple/30 rounded-t"
                  style={{ height: `${height}%` }}
                />
              )
            })}
          </div>
        )}

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