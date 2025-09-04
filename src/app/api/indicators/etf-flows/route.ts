import { NextResponse } from 'next/server';
import { ETFFlowsClient } from '@/lib/api/etf-flows';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Initialize client with optional Alpha Vantage key from env
    const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    const client = new ETFFlowsClient(alphaVantageKey);
    
    // Get ETF flows
    const flows = await client.calculateETFFlows();
    const gbtcPremium = await client.getGBTCPremium();
    
    return NextResponse.json({
      flows: {
        netFlow: flows.netFlow,
        totalInflow: flows.totalInflow,
        totalOutflow: flows.totalOutflow,
        flowByETF: flows.flowByETF,
        dominantFlow: flows.dominantFlow
      },
      gbtcPremium: gbtcPremium || 0,
      signal: flows.signal,
      confidence: flows.confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching ETF flows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ETF flows' },
      { status: 500 }
    );
  }
}