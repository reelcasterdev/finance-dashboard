import { NextResponse } from 'next/server';
import { BitcoinMagazineClient } from '@/lib/api/bitcoin-magazine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = new BitcoinMagazineClient(process.env.BITCOIN_MAGAZINE_API_KEY);
    
    const reserveRiskData = await client.getReserveRisk();
    
    // Transform to match indicator format
    return NextResponse.json({
      id: 'reserve-risk',
      value: reserveRiskData.risk * 1000, // Scale for display (multiply by 1000)
      signal: reserveRiskData.signal,
      confidence: reserveRiskData.confidence,
      weight: 0.08, // Give Reserve Risk a meaningful weight
      description: 'Risk/Reward opportunity metric',
      details: {
        risk: reserveRiskData.risk,
        opportunity: reserveRiskData.opportunity,
        interpretation: getReserveRiskInterpretation(reserveRiskData.risk, reserveRiskData.opportunity)
      },
      timestamp: reserveRiskData.timestamp
    });
  } catch (error) {
    console.error('Error fetching Reserve Risk:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      id: 'reserve-risk',
      value: 3.5, // 0.0035 * 1000
      signal: 'neutral',
      confidence: 50,
      weight: 0.08,
      description: 'Risk/Reward opportunity metric',
      details: {
        risk: 0.0035,
        opportunity: 'medium',
        interpretation: 'Moderate risk/reward ratio - neutral market conditions'
      },
      timestamp: new Date()
    });
  }
}

function getReserveRiskInterpretation(risk: number, opportunity: string): string {
  const riskLevel = opportunity === 'high' ? 'Low risk' : 
                    opportunity === 'medium' ? 'Moderate risk' : 
                    'High risk';
  
  if (risk > 0.02) {
    return `${riskLevel}, low reward potential - consider taking profits`;
  } else if (risk > 0.01) {
    return `${riskLevel}, moderate reward potential - market heating up`;
  } else if (risk > 0.003) {
    return `${riskLevel}, balanced reward potential - neutral conditions`;
  } else if (risk > 0.0015) {
    return `${riskLevel}, high reward potential - accumulation zone`;
  } else {
    return `${riskLevel}, extreme reward potential - historic buying opportunity`;
  }
}