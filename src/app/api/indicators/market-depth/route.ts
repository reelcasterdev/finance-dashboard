import { NextResponse } from 'next/server';
import { CoinbaseClient } from '@/lib/api/coinbase';

export async function GET() {
  try {
    const coinbase = new CoinbaseClient(
      process.env.COINBASE_API_KEY!,
      process.env.COINBASE_API_SECRET!
    );

    const [orderBook, recentTrades, stats] = await Promise.all([
      coinbase.getOrderBook(2),
      coinbase.getRecentTrades(100),
      coinbase.get24HourStats(),
    ]);

    // Calculate market pressure based on order book and trades
    const marketPressure = {
      bidAskRatio: orderBook.bidAskRatio,
      buyPressure: recentTrades.buyPressure,
      volumeSignal: recentTrades.volumeSignal,
      marketSentiment: orderBook.marketSentiment,
      spread: orderBook.spread,
      volume24h: stats.volume,
      high24h: stats.high,
      low24h: stats.low,
    };

    return NextResponse.json({
      orderBook: {
        topBids: orderBook.bids.slice(0, 5),
        topAsks: orderBook.asks.slice(0, 5),
        spread: orderBook.spread,
      },
      trades: {
        recent: recentTrades.trades.slice(0, 10),
        buyVolume: recentTrades.buyVolume,
        sellVolume: recentTrades.sellVolume,
      },
      marketPressure,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in market-depth API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market depth' },
      { status: 500 }
    );
  }
}