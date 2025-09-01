"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

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
  const getSignalColor = () => {
    switch (signal) {
      case 'strong-buy':
        return 'bg-indicator-strong-buy text-discord-bg-tertiary'
      case 'buy':
        return 'bg-indicator-buy text-discord-bg-tertiary'
      case 'neutral':
        return 'bg-indicator-neutral text-discord-bg-tertiary'
      case 'sell':
        return 'bg-indicator-sell text-discord-white'
      case 'strong-sell':
        return 'bg-indicator-strong-sell text-discord-white'
    }
  }

  const getSignalText = () => {
    switch (signal) {
      case 'strong-buy':
        return 'STRONG BUY - Accumulation Zone'
      case 'buy':
        return 'BUY - Good Entry Point'
      case 'neutral':
        return 'NEUTRAL - Wait for Confirmation'
      case 'sell':
        return 'SELL - Consider Taking Profits'
      case 'strong-sell':
        return 'STRONG SELL - Peak Zone'
    }
  }

  const rotation = (score / 100) * 180 - 90

  return (
    <Card className="bg-discord-bg-secondary/95 border-2 border-discord-blurple/30 shadow-2xl">
      <CardHeader className="border-b border-discord-border">
        <CardTitle className="text-2xl text-center text-discord-text-primary flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-discord-green animate-pulse" />
          Bitcoin Cycle Composite Score
          <div className="w-2 h-2 rounded-full bg-discord-green animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative w-64 h-32 mx-auto">
          {/* Gauge background */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#57F287" />
                <stop offset="33%" stopColor="#FEE75C" />
                <stop offset="66%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#ED4245" />
              </linearGradient>
            </defs>
            
            {/* Background arc */}
            <path
              d="M 20 80 A 60 60 0 0 1 180 80"
              fill="none"
              stroke="#202225"
              strokeWidth="20"
              strokeLinecap="round"
            />
            
            {/* Colored arc */}
            <path
              d="M 20 80 A 60 60 0 0 1 180 80"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${score * 1.88} 188`}
            />
          </svg>
          
          {/* Needle */}
          <div 
            className="absolute bottom-0 left-1/2 w-1 h-20 bg-discord-white origin-bottom shadow-discord"
            style={{
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              transition: 'transform 1s ease-in-out'
            }}
          >
            <div className="absolute -top-2 -left-2 w-5 h-5 bg-discord-white rounded-full" />
          </div>
          
          {/* Center dot */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-discord-bg-tertiary rounded-full border-2 border-discord-white" />
        </div>

        <div className="text-center space-y-4">
          <div className="text-5xl font-bold text-discord-text-primary">
            {score.toFixed(0)}%
          </div>
          
          <Badge className={cn("text-lg px-4 py-2", getSignalColor())}>
            {getSignalText()}
          </Badge>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="text-center">
              <div className="text-discord-text-secondary text-sm">Peak Probability</div>
              <div className="text-2xl font-bold text-discord-fuchsia">
                {peakProbability.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-discord-text-secondary text-sm">Last Update</div>
              <div className="text-sm text-discord-text-primary">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          {peakProbability > 75 && (
            <div className="flex items-center justify-center gap-2 p-3 bg-discord-red/20 rounded-lg animate-pulse">
              <AlertTriangle className="w-5 h-5 text-discord-red" />
              <span className="text-discord-red font-semibold">
                High Peak Probability - Consider Risk Management
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}