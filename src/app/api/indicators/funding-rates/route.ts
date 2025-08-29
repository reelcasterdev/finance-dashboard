import { NextResponse } from 'next/server';
import { CoinGeckoClient } from '@/lib/api/coingecko';

export async function GET() {
  try {
    const coingecko = new CoinGeckoClient(process.env.COINGECKO_API_KEY!);
    
    const fundingData = await coingecko.getFundingRates();
    
    // Calculate funding rate signal based on open interest
    let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
    let confidence = 50;
    
    // High open interest with increasing volume suggests overheating
    if (fundingData.openInterest > 100000) {
      signal = 'sell';
      confidence = 70;
    } else if (fundingData.openInterest < 50000) {
      signal = 'buy';
      confidence = 60;
    }
    
    return NextResponse.json({
      openInterest: fundingData.openInterest,
      volume24h: fundingData.volume24h,
      signal,
      confidence,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in funding-rates API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funding rates' },
      { status: 500 }
    );
  }
}