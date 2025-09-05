import { NextResponse } from 'next/server';
import { CoinGeckoClient } from '@/lib/api/coingecko';

export const dynamic = 'force-dynamic';

// Rainbow Chart bands based on logarithmic regression
// These multipliers are applied to the log regression line
const RAINBOW_BANDS = [
  { name: 'Maximum Bubble', multiplier: 2.5, color: 'red', signal: 'sell', confidence: 95 },
  { name: 'Sell Zone', multiplier: 2.0, color: 'orange', signal: 'sell', confidence: 85 },
  { name: 'FOMO Zone', multiplier: 1.5, color: 'yellow', signal: 'sell', confidence: 70 },
  { name: 'Is This A Bubble?', multiplier: 1.2, color: 'light-green', signal: 'neutral', confidence: 60 },
  { name: 'HODL Zone', multiplier: 1.0, color: 'green', signal: 'neutral', confidence: 50 },
  { name: 'Still Cheap', multiplier: 0.8, color: 'blue', signal: 'buy', confidence: 60 },
  { name: 'Accumulation Zone', multiplier: 0.6, color: 'indigo', signal: 'buy', confidence: 75 },
  { name: 'Buy Zone', multiplier: 0.4, color: 'purple', signal: 'buy', confidence: 85 },
  { name: 'Fire Sale', multiplier: 0.2, color: 'dark-purple', signal: 'buy', confidence: 95 },
];

function calculateLogRegression(daysSinceGenesis: number): number {
  // Bitcoin Rainbow Chart logarithmic regression formula
  // Based on days since Bitcoin genesis block (Jan 3, 2009)
  
  // Updated coefficients for better accuracy (as of 2024)
  // Logarithmic regression: Price = 10^(a * log10(days) + b)
  const a = 2.66167;
  const b = -17.9184;
  
  // Calculate using base 10 logarithm
  const logDays = Math.log10(daysSinceGenesis);
  const logPrice = a * logDays + b;
  
  // Convert from log space back to price
  return Math.pow(10, logPrice);
}

function getCurrentBand(price: number, regressionPrice: number): typeof RAINBOW_BANDS[0] {
  const ratio = price / regressionPrice;
  
  // Find the appropriate band based on the ratio
  for (let i = RAINBOW_BANDS.length - 1; i >= 0; i--) {
    if (ratio <= RAINBOW_BANDS[i].multiplier) {
      return RAINBOW_BANDS[i];
    }
  }
  
  return RAINBOW_BANDS[0]; // Default to highest band if above all
}

export async function GET() {
  try {
    const coingecko = new CoinGeckoClient(process.env.COINGECKO_API_KEY!);
    
    // Get current Bitcoin price
    const priceData = await coingecko.getBitcoinPrice();
    const currentPrice = priceData.usd;
    
    // Calculate days since Bitcoin genesis block (January 3, 2009)
    const genesisDate = new Date('2009-01-03');
    const today = new Date();
    const daysSinceGenesis = Math.floor((today.getTime() - genesisDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate the regression line price
    const regressionPrice = calculateLogRegression(daysSinceGenesis);
    
    // Determine which band we're in
    const currentBand = getCurrentBand(currentPrice, regressionPrice);
    
    // Calculate normalized score (0-100)
    const ratio = currentPrice / regressionPrice;
    const normalizedScore = Math.min(100, Math.max(0, (ratio / RAINBOW_BANDS[0].multiplier) * 100));
    
    // Calculate distance to next band
    const currentBandIndex = RAINBOW_BANDS.findIndex(b => b.name === currentBand.name);
    let nextBandPrice = null;
    let distanceToNextBand = null;
    
    if (currentBandIndex > 0) {
      const nextBand = RAINBOW_BANDS[currentBandIndex - 1];
      nextBandPrice = regressionPrice * nextBand.multiplier;
      distanceToNextBand = ((nextBandPrice - currentPrice) / currentPrice) * 100;
    }
    
    return NextResponse.json({
      id: 'rainbow',
      value: normalizedScore,
      signal: currentBand.signal,
      confidence: currentBand.confidence,
      weight: 0.04,
      description: 'Logarithmic growth bands',
      details: {
        currentPrice,
        regressionPrice,
        ratio,
        daysSinceGenesis,
        currentBand: {
          name: currentBand.name,
          color: currentBand.color,
          multiplier: currentBand.multiplier
        },
        nextBandPrice,
        distanceToNextBand,
        interpretation: `Bitcoin is in the ${currentBand.name} zone`,
        allBands: RAINBOW_BANDS.map(band => ({
          name: band.name,
          price: regressionPrice * band.multiplier,
          color: band.color
        }))
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error calculating Rainbow Chart:', error);
    
    // Return a reasonable default
    return NextResponse.json({
      id: 'rainbow',
      value: 50,
      signal: 'neutral',
      confidence: 30,
      weight: 0.04,
      description: 'Logarithmic growth bands',
      error: 'Failed to calculate Rainbow Chart',
      timestamp: new Date()
    });
  }
}