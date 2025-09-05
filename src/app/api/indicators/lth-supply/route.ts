import { NextResponse } from 'next/server';
import { BitcoinMagazineClient } from '@/lib/api/bitcoin-magazine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = new BitcoinMagazineClient(process.env.BITCOIN_MAGAZINE_API_KEY);
    
    const lthData = await client.getLTHSupply();
    
    // Transform to match indicator format
    return NextResponse.json({
      id: 'lth-supply',
      value: lthData.lthPercentage,
      signal: lthData.signal,
      confidence: lthData.confidence,
      weight: 0.18,
      description: 'Long-Term Holder Supply percentage',
      details: {
        lthSupply: lthData.lthSupply,
        sthSupply: lthData.sthSupply,
        lthPercentage: lthData.lthPercentage,
        sthPercentage: lthData.sthPercentage,
        netPosition: lthData.netPosition
      },
      timestamp: lthData.timestamp
    });
  } catch (error) {
    console.error('Error fetching LTH Supply:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      id: 'lth-supply',
      value: 65,
      signal: 'neutral',
      confidence: 50,
      weight: 0.18,
      description: 'Long-Term Holder Supply percentage',
      details: {
        lthSupply: 14000000,
        sthSupply: 5500000,
        lthPercentage: 65,
        sthPercentage: 25,
        netPosition: 'neutral'
      },
      timestamp: new Date()
    });
  }
}