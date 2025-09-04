import { NextResponse } from 'next/server';
import { ExchangeReservesClient } from '@/lib/api/exchange-reserves';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Initialize with optional CryptoQuant API key
    const cryptoQuantKey = process.env.CRYPTOQUANT_API_KEY;
    const client = new ExchangeReservesClient(cryptoQuantKey);
    
    // Get exchange reserves
    const reserves = await client.getExchangeReserves();
    const netflows = await client.getExchangeNetflows();
    
    return NextResponse.json({
      reserves: {
        total: reserves.totalReserves,
        byExchange: reserves.exchangeReserves.map(ex => ({
          name: ex.exchange,
          balance: ex.balance,
          change24h: ex.change24h
        }))
      },
      flows: {
        daily: netflows.daily,
        weekly: netflows.weekly,
        trend: netflows.trend
      },
      signal: reserves.signal,
      confidence: reserves.confidence,
      lastUpdate: reserves.lastUpdate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching exchange reserves:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange reserves' },
      { status: 500 }
    );
  }
}