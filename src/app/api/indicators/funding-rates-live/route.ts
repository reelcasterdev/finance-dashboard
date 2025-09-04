import { NextResponse } from 'next/server';
import { FundingRatesClient } from '@/lib/api/funding-rates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = new FundingRatesClient();
    
    // Get aggregated funding rates
    const funding = await client.getAggregatedFunding();
    
    // Get historical funding for trend
    const historical = await client.getHistoricalFunding(7);
    
    // Calculate average funding over last 7 days
    const avgFunding = historical.length > 0
      ? historical.reduce((sum, item) => sum + item.rate, 0) / historical.length
      : funding.weightedAverage;
    
    return NextResponse.json({
      current: {
        rate: funding.weightedAverage,
        binance: funding.binance,
        bybit: funding.bybit,
        okx: funding.okx,
        deribit: funding.deribit
      },
      openInterest: funding.openInterestUSD,
      nextFundingTime: funding.nextFundingTime,
      avgFunding7d: avgFunding,
      trend: funding.weightedAverage > avgFunding ? 'increasing' : 'decreasing',
      signal: funding.signal,
      confidence: funding.confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching funding rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funding rates' },
      { status: 500 }
    );
  }
}