"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarketData {
  currentPrice: number
  priceChangePercentage24h: number
  priceChangePercentage7d: number
  priceChangePercentage30d: number
  priceChangePercentage1y: number
  marketCap: number
  totalVolume: number
  ath: number
  atl: number
  athChangePercentage: number
  circulatingSupply: number
  high24h: number
  low24h: number
  sparkline7d?: number[]
}

interface MarketOverviewProps {
  bitcoinData?: {
    marketData?: MarketData
  }
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
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Current Price */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Bitcoin Price</p>
            <div className="space-y-1">
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(md.currentPrice)}
              </p>
              <div className="flex items-center gap-1">
                {priceChange >= 0 ? (
                  <ArrowUp className="w-3 h-3 text-green-600" />
                ) : (
                  <ArrowDown className="w-3 h-3 text-red-600" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  priceChange >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {Math.abs(priceChange).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Market Cap */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Market Cap</p>
            <p className="text-xl font-bold text-gray-900">
              {formatLargeCurrency(md.marketCap)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Rank #1
            </p>
          </div>

          {/* 24h Volume */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">24h Volume</p>
            <p className="text-xl font-bold text-gray-900">
              {formatLargeCurrency(md.totalVolume)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {((md.totalVolume / md.marketCap) * 100).toFixed(2)}% of MCap
            </p>
          </div>

          {/* ATH Distance */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">From ATH</p>
            <p className={cn(
              "text-xl font-bold",
              md.athChangePercentage < -20 ? "text-green-600" : 
              md.athChangePercentage < -10 ? "text-amber-600" : 
              "text-red-600"
            )}>
              {md.athChangePercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ATH: {formatCurrency(md.ath)}
            </p>
          </div>
        </div>

        {/* Price Ranges */}
        <div className="border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* 24h Range */}
            <div>
              <p className="text-xs text-gray-500 mb-2">24h Range</p>
              <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                    style={{
                      width: `${((md.currentPrice - md.low24h) / (md.high24h - md.low24h)) * 100}%`
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-600">{formatCurrency(md.low24h)}</span>
                  <span className="text-xs text-gray-600">{formatCurrency(md.high24h)}</span>
                </div>
              </div>
            </div>

            {/* 52w Range */}
            <div>
              <p className="text-xs text-gray-500 mb-2">52w Range</p>
              <div className="relative">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{
                      width: `${((md.currentPrice - md.atl) / (md.ath - md.atl)) * 100}%`
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-600">{formatCurrency(md.atl)}</span>
                  <span className="text-xs text-gray-600">{formatCurrency(md.ath)}</span>
                </div>
              </div>
            </div>

            {/* Supply Info */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Circulating Supply</p>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {(md.circulatingSupply / 1e6).toFixed(2)}M BTC
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${(md.circulatingSupply / 21000000) * 100}%`
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  {((md.circulatingSupply / 21000000) * 100).toFixed(1)}% of max supply
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 mb-3">Performance</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '24h', value: md.priceChangePercentage24h },
              { label: '7d', value: md.priceChangePercentage7d },
              { label: '30d', value: md.priceChangePercentage30d },
              { label: '1y', value: md.priceChangePercentage1y }
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <Badge 
                  variant={value >= 0 ? "success" : "destructive"}
                  className="w-full justify-center"
                >
                  {value >= 0 ? '+' : ''}{value.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Sparkline */}
        {md.sparkline7d && (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-500">7 Day Trend</p>
              <Badge variant="secondary" className="text-xs">
                {md.priceChangePercentage7d >= 0 ? '+' : ''}{md.priceChangePercentage7d.toFixed(2)}%
              </Badge>
            </div>
            <div className="h-16 flex items-end gap-px">
              {md.sparkline7d.slice(-168).map((val: number, idx: number) => {
                const data = md.sparkline7d?.slice(-168) || []
                const min = Math.min(...data)
                const max = Math.max(...data)
                const height = ((val - min) / (max - min)) * 100
                const isRecent = idx >= data.length - 24
                
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex-1 rounded-t transition-all",
                      isRecent 
                        ? val > data[idx - 1] ? "bg-green-400" : "bg-red-400"
                        : val > data[idx - 1] ? "bg-green-200" : "bg-red-200"
                    )}
                    style={{ height: `${height}%`, minHeight: '2px' }}
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