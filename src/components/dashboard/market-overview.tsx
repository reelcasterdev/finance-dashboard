"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, DollarSign, TrendingUp, Activity, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarketOverviewProps {
  bitcoinData?: any
}

export function MarketOverview({ bitcoinData }: MarketOverviewProps) {
  if (!bitcoinData?.marketData) {
    return null
  }

  const md = bitcoinData.marketData
  const priceChange = md.priceChangePercentage24h

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatLargeCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return formatCurrency(value)
  }

  return (
    <Card className="bg-discord-bg-secondary/95 border-2 border-discord-blurple/20 shadow-xl">
      <CardHeader className="border-b border-discord-border bg-discord-bg-tertiary/50">
        <CardTitle className="text-xl text-discord-text-primary flex items-center gap-2">
          <div className="p-2 bg-discord-blurple/20 rounded-lg">
            <Activity className="w-5 h-5 text-discord-blurple" />
          </div>
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Current Price */}
          <div className="space-y-1">
            <p className="text-sm text-discord-text-secondary">Bitcoin Price</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-discord-text-primary">
                {formatCurrency(md.currentPrice)}
              </p>
              <Badge 
                variant={priceChange >= 0 ? "success" : "destructive"}
                className="text-xs"
              >
                {priceChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {Math.abs(priceChange).toFixed(2)}%
              </Badge>
            </div>
          </div>

          {/* Market Cap */}
          <div className="space-y-1">
            <p className="text-sm text-discord-text-secondary">Market Cap</p>
            <p className="text-2xl font-bold text-discord-text-primary">
              {formatLargeCurrency(md.marketCap)}
            </p>
          </div>

          {/* 24h Volume */}
          <div className="space-y-1">
            <p className="text-sm text-discord-text-secondary">24h Volume</p>
            <p className="text-2xl font-bold text-discord-text-primary">
              {formatLargeCurrency(md.totalVolume)}
            </p>
          </div>

          {/* ATH Distance */}
          <div className="space-y-1">
            <p className="text-sm text-discord-text-secondary">From ATH</p>
            <p className={cn(
              "text-2xl font-bold",
              md.athChangePercentage < -20 ? "text-discord-green" : 
              md.athChangePercentage < -10 ? "text-discord-yellow" : 
              "text-discord-red"
            )}>
              {md.athChangePercentage.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-discord-border">
          {/* 24h Range */}
          <div className="space-y-1">
            <p className="text-sm text-discord-text-secondary">24h Range</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-discord-red">{formatCurrency(md.low24h)}</span>
              <span className="text-discord-text-secondary">-</span>
              <span className="text-discord-green">{formatCurrency(md.high24h)}</span>
            </div>
          </div>

          {/* 7d Change */}
          <div className="space-y-1">
            <p className="text-sm text-discord-text-secondary">7d Change</p>
            <p className={cn(
              "text-lg font-semibold",
              md.priceChangePercentage7d >= 0 ? "text-discord-green" : "text-discord-red"
            )}>
              {md.priceChangePercentage7d >= 0 ? '+' : ''}{md.priceChangePercentage7d.toFixed(2)}%
            </p>
          </div>

          {/* 30d Change */}
          <div className="space-y-1">
            <p className="text-sm text-discord-text-secondary">30d Change</p>
            <p className={cn(
              "text-lg font-semibold",
              md.priceChangePercentage30d >= 0 ? "text-discord-green" : "text-discord-red"
            )}>
              {md.priceChangePercentage30d >= 0 ? '+' : ''}{md.priceChangePercentage30d.toFixed(2)}%
            </p>
          </div>

          {/* 1y Change */}
          <div className="space-y-1">
            <p className="text-sm text-discord-text-secondary">1y Change</p>
            <p className={cn(
              "text-lg font-semibold",
              md.priceChangePercentage1y >= 0 ? "text-discord-green" : "text-discord-red"
            )}>
              {md.priceChangePercentage1y >= 0 ? '+' : ''}{md.priceChangePercentage1y.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Mini sparkline */}
        {md.sparkline7d && (
          <div className="mt-4 pt-4 border-t border-discord-border">
            <p className="text-xs text-discord-text-secondary mb-2">7 Day Trend</p>
            <div className="h-12 flex items-end gap-px">
              {md.sparkline7d.slice(-50).map((val: number, idx: number) => {
                const min = Math.min(...md.sparkline7d.slice(-50))
                const max = Math.max(...md.sparkline7d.slice(-50))
                const height = ((val - min) / (max - min)) * 100
                const isGreen = idx > 0 && val > md.sparkline7d.slice(-50)[idx - 1]
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex-1 rounded-t transition-all",
                      isGreen ? "bg-discord-green/50" : "bg-discord-red/50"
                    )}
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}