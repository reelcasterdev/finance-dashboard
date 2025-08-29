export interface IndicatorWeight {
  id: string;
  name: string;
  weight: number;
  rank: number;
  description: string;
}

export const INDICATOR_WEIGHTS: IndicatorWeight[] = [
  {
    id: 'pi-cycle',
    name: 'Pi Cycle Top Indicator',
    weight: 0.30,
    rank: 1,
    description: '111DMA crossing 350DMA×2 signals cycle tops',
  },
  {
    id: 'mvrv',
    name: 'MVRV Ratio',
    weight: 0.28,
    rank: 2,
    description: 'Market Value / Realized Value ratio',
  },
  {
    id: 's2f',
    name: 'Stock-to-Flow Model',
    weight: 0.22,
    rank: 3,
    description: 'Scarcity-based valuation model',
  },
  {
    id: 'lth-supply',
    name: 'Long-Term Holder Supply',
    weight: 0.18,
    rank: 4,
    description: 'Coins held >155 days',
  },
  {
    id: 'puell',
    name: 'Puell Multiple',
    weight: 0.16,
    rank: 5,
    description: 'Daily issuance value / 365-day MA',
  },
  {
    id: 'nvt',
    name: 'NVT Ratio',
    weight: 0.13,
    rank: 6,
    description: 'Network Value to Transactions',
  },
  {
    id: 'etf-flows',
    name: 'Bitcoin ETF Flows',
    weight: 0.15,
    rank: 7,
    description: 'Institutional demand tracking',
  },
  {
    id: 'exchange-reserves',
    name: 'Exchange Reserves',
    weight: 0.12,
    rank: 8,
    description: 'Bitcoin held on exchanges',
  },
  {
    id: 'mpi',
    name: 'Miner Position Index',
    weight: 0.10,
    rank: 9,
    description: 'Miner selling pressure',
  },
  {
    id: 'fear-greed',
    name: 'Fear & Greed Index',
    weight: 0.08,
    rank: 10,
    description: 'Market sentiment indicator',
  },
  {
    id: 'btc-dominance',
    name: 'Bitcoin Dominance',
    weight: 0.07,
    rank: 11,
    description: 'BTC market cap percentage',
  },
  {
    id: 'funding-rates',
    name: 'Funding Rates',
    weight: 0.06,
    rank: 12,
    description: 'Perpetual futures funding',
  },
  {
    id: 'coinbase-premium',
    name: 'Coinbase Premium',
    weight: 0.05,
    rank: 13,
    description: 'US institutional demand',
  },
  {
    id: 'rainbow',
    name: 'Rainbow Chart',
    weight: 0.04,
    rank: 14,
    description: 'Logarithmic growth bands',
  },
  {
    id: 'hash-ribbons',
    name: 'Hash Ribbons',
    weight: 0.03,
    rank: 15,
    description: 'Mining hash rate signals',
  },
];

// Normalize weights to ensure they sum to 1
const totalWeight = INDICATOR_WEIGHTS.reduce((sum, ind) => sum + ind.weight, 0);
INDICATOR_WEIGHTS.forEach(ind => {
  ind.weight = ind.weight / totalWeight;
});