import { NextResponse } from 'next/server';
import { MultiExchangeClient } from '@/lib/api/multi-exchange';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = new MultiExchangeClient();
    
    // Get premium data
    const premiums = await client.calculatePremiums();
    const spread = await client.getSpreadAnalysis();
    
    return NextResponse.json({
      premiums: {
        coinbase: premiums.coinbasePremium,
        kraken: premiums.krakenPremium,
        bitstamp: premiums.bitstampPremium,
        us: premiums.usPremium,
        korean: premiums.koreanPremium,
        japan: premiums.japanPremium
      },
      spread: spread ? {
        max: spread.maxPrice,
        min: spread.minPrice,
        avg: spread.avgPrice,
        spreadPercent: spread.spreadPercentage,
        arbitrageOpportunity: spread.spread > 100
      } : null,
      dominantExchange: premiums.dominantExchange,
      signal: premiums.signal,
      confidence: premiums.confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching global premiums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch global premiums' },
      { status: 500 }
    );
  }
}