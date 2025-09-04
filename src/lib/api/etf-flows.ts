import axios from 'axios';

// Bitcoin ETF tickers
const BTC_ETFS: Record<string, string> = {
  'GBTC': 'Grayscale Bitcoin Trust',
  'IBIT': 'iShares Bitcoin Trust',
  'FBTC': 'Fidelity Wise Origin Bitcoin Fund',
  'ARKB': 'ARK 21Shares Bitcoin ETF',
  'BITB': 'Bitwise Bitcoin ETF',
  'HODL': 'VanEck Bitcoin Trust',
  'BITO': 'ProShares Bitcoin Strategy ETF',
  'BTF': 'Valkyrie Bitcoin Fund',
  'EZBC': 'Franklin Bitcoin ETF',
  'BRRR': 'Valkyrie Bitcoin Fund'
};

interface ETFData {
  symbol: string;
  name: string;
  price: number;
  volume: number;
  marketCap: number;
  sharesOutstanding?: number;
  nav?: number;
  premium?: number;
  dayChange: number;
  dayChangePercent: number;
}

interface ETFFlows {
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
  flowByETF: Record<string, number>;
  dominantFlow: 'inflow' | 'outflow' | 'neutral';
  signal: 'buy' | 'neutral' | 'sell';
  confidence: number;
}

export class ETFFlowsClient {
  private yahooClient;
  private alphaVantageKey?: string;
  private cache = new Map<string, { data: ETFData | null; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(alphaVantageKey?: string) {
    this.yahooClient = axios.create({
      baseURL: 'https://query1.finance.yahoo.com'
    });
    this.alphaVantageKey = alphaVantageKey;
  }

  // Get ETF data from Yahoo Finance (free, no key needed)
  async getETFDataYahoo(symbol: string): Promise<ETFData | null> {
    const cacheKey = `yahoo_${symbol}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await this.yahooClient.get(`/v8/finance/chart/${symbol}`, {
        params: {
          region: 'US',
          lang: 'en-US',
          includePrePost: false,
          interval: '1d',
          range: '5d'
        }
      });

      const result = response.data.chart.result[0];
      const quote = result.indicators.quote[0];
      const meta = result.meta;
      const latestPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
      const latestVolume = quote.volume[quote.volume.length - 1];
      
      // Calculate day change
      const prevClose = meta.previousClose || quote.close[quote.close.length - 2];
      const dayChange = latestPrice - prevClose;
      const dayChangePercent = (dayChange / prevClose) * 100;

      const etfData: ETFData = {
        symbol,
        name: BTC_ETFS[symbol] || meta.longName,
        price: latestPrice,
        volume: latestVolume,
        marketCap: meta.marketCap || latestPrice * (meta.sharesOutstanding || 0),
        sharesOutstanding: meta.sharesOutstanding,
        dayChange,
        dayChangePercent
      };

      this.cache.set(cacheKey, { data: etfData, timestamp: Date.now() });
      return etfData;
    } catch (error) {
      console.error(`Error fetching ETF data for ${symbol}:`, error);
      return null;
    }
  }

  // Get ETF data from Alpha Vantage (optional, more detailed)
  async getETFDataAlphaVantage(symbol: string): Promise<ETFData | null> {
    if (!this.alphaVantageKey) {
      return null;
    }

    const cacheKey = `av_${symbol}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const response = await axios.get('https://www.alphavantage.co/query', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: this.alphaVantageKey
        }
      });

      const quote = response.data['Global Quote'];
      if (!quote) return null;

      const etfData: ETFData = {
        symbol,
        name: BTC_ETFS[symbol],
        price: parseFloat(quote['05. price']),
        volume: parseInt(quote['06. volume']),
        marketCap: 0, // Not provided by Alpha Vantage
        dayChange: parseFloat(quote['09. change']),
        dayChangePercent: parseFloat(quote['10. change percent'].replace('%', ''))
      };

      this.cache.set(cacheKey, { data: etfData, timestamp: Date.now() });
      return etfData;
    } catch (error) {
      console.error(`Error fetching Alpha Vantage data for ${symbol}:`, error);
      return null;
    }
  }

  // Calculate ETF flows based on volume and price changes
  async calculateETFFlows(): Promise<ETFFlows> {
    const etfSymbols = Object.keys(BTC_ETFS);
    const etfDataPromises = etfSymbols.map(symbol => this.getETFDataYahoo(symbol));
    const etfDataArray = await Promise.all(etfDataPromises);
    
    let totalInflow = 0;
    let totalOutflow = 0;
    const flowByETF: Record<string, number> = {};
    
    for (const etfData of etfDataArray) {
      if (!etfData) continue;
      
      // Estimate flow based on volume and price change
      // Positive price change with high volume suggests inflow
      // Negative price change with high volume suggests outflow
      const avgPrice = etfData.price;
      const volumeUSD = etfData.volume * avgPrice;
      
      // Simple flow estimation based on price direction and volume
      const flowMultiplier = etfData.dayChangePercent / 100;
      const estimatedFlow = volumeUSD * flowMultiplier * 0.1; // Conservative estimate
      
      flowByETF[etfData.symbol] = estimatedFlow;
      
      if (estimatedFlow > 0) {
        totalInflow += estimatedFlow;
      } else {
        totalOutflow += Math.abs(estimatedFlow);
      }
    }
    
    const netFlow = totalInflow - totalOutflow;
    
    // Determine signal based on flow
    let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
    let confidence = 50;
    
    if (netFlow > 100_000_000) { // $100M+ inflow
      signal = 'buy';
      confidence = Math.min(70 + (netFlow / 10_000_000), 90);
    } else if (netFlow < -50_000_000) { // $50M+ outflow
      signal = 'sell';
      confidence = Math.min(70 + (Math.abs(netFlow) / 5_000_000), 85);
    } else {
      confidence = 50 + Math.abs(netFlow) / 10_000_000;
    }
    
    return {
      totalInflow,
      totalOutflow,
      netFlow,
      flowByETF,
      dominantFlow: netFlow > 10_000_000 ? 'inflow' : 
                    netFlow < -10_000_000 ? 'outflow' : 'neutral',
      signal,
      confidence
    };
  }

  // Get GBTC premium/discount
  async getGBTCPremium(): Promise<number | null> {
    try {
      const gbtcData = await this.getETFDataYahoo('GBTC');
      if (!gbtcData) return null;
      
      // Get Bitcoin price
      const btcResponse = await this.yahooClient.get('/v8/finance/chart/BTC-USD');
      const btcPrice = btcResponse.data.chart.result[0].meta.regularMarketPrice;
      
      // GBTC holds approximately 0.00094876 BTC per share (as of 2024)
      const btcPerShare = 0.00094876;
      const nav = btcPrice * btcPerShare;
      const premium = ((gbtcData.price - nav) / nav) * 100;
      
      return premium;
    } catch (error) {
      console.error('Error calculating GBTC premium:', error);
      return null;
    }
  }
}