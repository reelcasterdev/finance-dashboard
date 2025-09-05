import { NextResponse } from 'next/server';
import { BitcoinMagazineClient } from '@/lib/api/bitcoin-magazine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = new BitcoinMagazineClient(process.env.BITCOIN_MAGAZINE_API_KEY);
    
    const mvrvData = await client.getMVRV();
    
    // Transform to match indicator format
    return NextResponse.json({
      id: 'mvrv',
      value: mvrvData.ratio,
      zScore: mvrvData.zScore,
      signal: mvrvData.signal,
      confidence: mvrvData.confidence,
      weight: 0.28,
      description: 'Market Value to Realized Value ratio',
      timestamp: mvrvData.timestamp
    });
  } catch (error) {
    console.error('Error fetching MVRV:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      id: 'mvrv',
      value: 2.3,
      zScore: 1.5,
      signal: 'neutral',
      confidence: 50,
      weight: 0.28,
      description: 'Market Value to Realized Value ratio',
      timestamp: new Date()
    });
  }
}