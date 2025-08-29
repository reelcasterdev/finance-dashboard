import { NextResponse } from 'next/server';
import { CoinGeckoClient } from '@/lib/api/coingecko';
import { CoinbaseClient } from '@/lib/api/coinbase';

export async function GET() {
  try {
    const coingecko = new CoinGeckoClient(process.env.COINGECKO_API_KEY!);
    const coinbase = new CoinbaseClient(
      process.env.COINBASE_API_KEY!,
      process.env.COINBASE_API_SECRET!
    );

    // Fetch from multiple sources
    const [coingeckoPrice, coinbasePrice, marketData] = await Promise.all([
      coingecko.getBitcoinPrice(),
      coinbase.getBitcoinPrice(),
      coingecko.getDetailedMarketData(),
    ]);

    return NextResponse.json({
      coingecko: coingeckoPrice,
      coinbase: coinbasePrice,
      marketData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in bitcoin-price API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin price' },
      { status: 500 }
    );
  }
}