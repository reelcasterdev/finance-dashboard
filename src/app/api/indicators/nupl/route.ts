import { NextResponse } from 'next/server';
import { BitcoinMagazineClient } from '@/lib/api/bitcoin-magazine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = new BitcoinMagazineClient(process.env.BITCOIN_MAGAZINE_API_KEY);
    
    const nuplData = await client.getNUPL();
    
    // Transform to match indicator format
    return NextResponse.json({
      id: 'nupl',
      value: nuplData.nupl,
      signal: nuplData.signal,
      confidence: nuplData.confidence,
      weight: 0.12, // Give NUPL a meaningful weight
      description: 'Net Unrealized Profit/Loss',
      details: {
        nupl: nuplData.nupl,
        marketPhase: nuplData.marketPhase,
        interpretation: getMarketPhaseDescription(nuplData.marketPhase)
      },
      timestamp: nuplData.timestamp
    });
  } catch (error) {
    console.error('Error fetching NUPL:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      id: 'nupl',
      value: 0.45,
      signal: 'neutral',
      confidence: 50,
      weight: 0.12,
      description: 'Net Unrealized Profit/Loss',
      details: {
        nupl: 0.45,
        marketPhase: 'optimism',
        interpretation: 'Market is in optimism phase - moderate bullish sentiment'
      },
      timestamp: new Date()
    });
  }
}

function getMarketPhaseDescription(phase: string): string {
  switch(phase) {
    case 'euphoria':
      return 'Market euphoria - extreme greed, potential top nearby';
    case 'belief':
      return 'Belief phase - strong bullish sentiment, but caution advised';
    case 'optimism':
      return 'Optimism phase - moderate bullish sentiment';
    case 'hope':
      return 'Hope phase - recovery beginning, accumulation opportunity';
    case 'fear':
      return 'Fear phase - good buying opportunity';
    case 'capitulation':
      return 'Capitulation phase - extreme fear, potential bottom';
    default:
      return 'Unknown market phase';
  }
}