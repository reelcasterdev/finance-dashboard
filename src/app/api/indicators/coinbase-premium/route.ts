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

    // Get Binance price from CoinGecko
    const binancePrice = await coingecko.getBinancePrice();
    
    if (!binancePrice) {
      throw new Error('Failed to fetch Binance price');
    }

    // Calculate Coinbase premium
    const premium = await coinbase.getCoinbasePremium(binancePrice);
    
    return NextResponse.json({
      ...premium,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in coinbase-premium API:', error);
    return NextResponse.json(
      { error: 'Failed to calculate Coinbase premium' },
      { status: 500 }
    );
  }
}