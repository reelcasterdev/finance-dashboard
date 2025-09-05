import { NextResponse } from 'next/server';
import { BitcoinMagazineClient } from '@/lib/api/bitcoin-magazine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = new BitcoinMagazineClient(process.env.BITCOIN_MAGAZINE_API_KEY);
    
    const puellData = await client.getPuellMultiple();
    
    // Transform to match indicator format
    return NextResponse.json({
      id: 'puell',
      value: puellData.multiple,
      signal: puellData.signal,
      confidence: puellData.confidence,
      weight: 0.16,
      description: 'Daily issuance value / 365-day MA',
      details: {
        multiple: puellData.multiple,
        minerRevenue: puellData.minerRevenue,
        ma365: puellData.ma365
      },
      timestamp: puellData.timestamp
    });
  } catch (error) {
    console.error('Error fetching Puell Multiple:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      id: 'puell',
      value: 1.2,
      signal: 'neutral',
      confidence: 50,
      weight: 0.16,
      description: 'Daily issuance value / 365-day MA',
      details: {
        multiple: 1.2,
        minerRevenue: 28000000,
        ma365: 23333333
      },
      timestamp: new Date()
    });
  }
}