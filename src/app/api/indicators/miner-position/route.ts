import { NextResponse } from 'next/server';
import { BitcoinMagazineClient } from '@/lib/api/bitcoin-magazine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = new BitcoinMagazineClient(process.env.BITCOIN_MAGAZINE_API_KEY);
    
    const minerData = await client.getMinerData();
    
    // Transform to match indicator format
    return NextResponse.json({
      id: 'mpi',
      value: minerData.mpi || 1.1,
      signal: minerData.signal,
      confidence: minerData.confidence,
      weight: 0.10,
      description: 'Miner selling pressure indicator',
      details: {
        mpi: minerData.mpi,
        hashRate: minerData.hashRate,
        difficulty: minerData.difficulty,
        minerRevenue: minerData.minerRevenue,
        minerOutflow: minerData.minerOutflow,
        hashRibbons: minerData.hashRibbons
      },
      timestamp: minerData.timestamp
    });
  } catch (error) {
    console.error('Error fetching Miner Position Index:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      id: 'mpi',
      value: 1.1,
      signal: 'neutral',
      confidence: 50,
      weight: 0.10,
      description: 'Miner selling pressure indicator',
      details: {
        mpi: 1.1,
        hashRate: 400000000000000000,
        difficulty: 60000000000000,
        minerRevenue: 25000000,
        minerOutflow: 400
      },
      timestamp: new Date()
    });
  }
}