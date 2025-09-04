import axios from 'axios';

interface FundingRate {
  symbol: string;
  fundingRate: number;
  fundingTime: number;
  nextFundingTime?: number;
  markPrice?: number;
}

interface OpenInterest {
  symbol: string;
  openInterest: number;
  openInterestValue: number;
  timestamp: number;
}

interface AggregatedFunding {
  weightedAverage: number;
  binance: number;
  bybit: number;
  okx: number;
  deribit: number;
  signal: 'buy' | 'neutral' | 'sell';
  confidence: number;
  openInterestUSD: number;
  nextFundingTime: number;
}

export class FundingRatesClient {
  private binanceClient;
  private bybitClient;
  private okxClient;
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private CACHE_DURATION = 60 * 1000; // 1 minute for funding rates

  constructor() {
    this.binanceClient = axios.create({
      baseURL: 'https://fapi.binance.com'
    });
    
    this.bybitClient = axios.create({
      baseURL: 'https://api.bybit.com'
    });
    
    this.okxClient = axios.create({
      baseURL: 'https://www.okx.com'
    });
  }

  // Get Binance funding rate (most liquid, most reliable)
  async getBinanceFunding(): Promise<FundingRate | null> {
    const cacheKey = 'binance_funding';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as FundingRate | null;
    }

    try {
      const [fundingResponse, markPriceResponse] = await Promise.all([
        this.binanceClient.get('/fapi/v1/fundingRate', {
          params: { symbol: 'BTCUSDT', limit: 1 }
        }),
        this.binanceClient.get('/fapi/v1/premiumIndex', {
          params: { symbol: 'BTCUSDT' }
        })
      ]);

      const funding = fundingResponse.data[0];
      const markPrice = markPriceResponse.data;
      
      const data: FundingRate = {
        symbol: 'BTCUSDT',
        fundingRate: parseFloat(funding.fundingRate),
        fundingTime: funding.fundingTime,
        nextFundingTime: markPrice.nextFundingTime,
        markPrice: parseFloat(markPrice.markPrice)
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching Binance funding rate:', error);
      return null;
    }
  }

  // Get Binance open interest
  async getBinanceOpenInterest(): Promise<OpenInterest | null> {
    try {
      const response = await this.binanceClient.get('/fapi/v1/openInterest', {
        params: { symbol: 'BTCUSDT' }
      });

      const markPriceResponse = await this.binanceClient.get('/fapi/v1/premiumIndex', {
        params: { symbol: 'BTCUSDT' }
      });
      
      const markPrice = parseFloat(markPriceResponse.data.markPrice);
      const openInterest = parseFloat(response.data.openInterest);
      
      return {
        symbol: 'BTCUSDT',
        openInterest,
        openInterestValue: openInterest * markPrice,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error fetching Binance open interest:', error);
      return null;
    }
  }

  // Get Bybit funding rate
  async getBybitFunding(): Promise<FundingRate | null> {
    const cacheKey = 'bybit_funding';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as FundingRate | null;
    }

    try {
      const response = await this.bybitClient.get('/v5/market/tickers', {
        params: {
          category: 'linear',
          symbol: 'BTCUSDT'
        }
      });

      const ticker = response.data.result.list[0];
      
      const data: FundingRate = {
        symbol: 'BTCUSDT',
        fundingRate: parseFloat(ticker.fundingRate),
        fundingTime: Date.now() + (8 * 60 * 60 * 1000), // Next funding in 8 hours
        markPrice: parseFloat(ticker.markPrice)
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching Bybit funding rate:', error);
      return null;
    }
  }

  // Get OKX funding rate (disabled due to CORS/regional restrictions)
  async getOKXFunding(): Promise<FundingRate | null> {
    // OKX API often has CORS issues and regional restrictions
    // Returning null to use other sources
    return null;
    
    /* Original implementation kept for reference
    const cacheKey = 'okx_funding';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as FundingRate | null;
    }

    try {
      const response = await this.okxClient.get('/api/v5/public/funding-rate', {
        params: { instId: 'BTC-USDT-SWAP' }
      });

      const funding = response.data.data[0];
      
      const data: FundingRate = {
        symbol: 'BTC-USDT-SWAP',
        fundingRate: parseFloat(funding.fundingRate),
        fundingTime: parseInt(funding.fundingTime),
        nextFundingTime: parseInt(funding.nextFundingTime)
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching OKX funding rate:', error);
      return null;
    }
    */
  }

  // Get Deribit funding rate (for derivatives traders)
  async getDeribitFunding(): Promise<FundingRate | null> {
    const cacheKey = 'deribit_funding';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as FundingRate | null;
    }

    try {
      // Updated to use the correct endpoint
      const response = await axios.get('https://www.deribit.com/api/v2/public/get_funding_rate_history', {
        params: { 
          instrument_name: 'BTC-PERPETUAL',
          start_timestamp: Date.now() - 3600000, // Last hour
          end_timestamp: Date.now()
        }
      });

      // Get the latest funding rate from history
      const fundingData = response.data.result;
      const latestRate = fundingData.length > 0 ? fundingData[fundingData.length - 1].interest_8h : 0;

      const data: FundingRate = {
        symbol: 'BTC-PERPETUAL',
        fundingRate: latestRate,
        fundingTime: Date.now(),
        nextFundingTime: Date.now() + (8 * 60 * 60 * 1000)
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      // Deribit often has issues, just return null to use other sources
      return null;
    }
  }

  // Aggregate funding rates from all exchanges
  async getAggregatedFunding(): Promise<AggregatedFunding> {
    const [binance, bybit, okx, deribit, openInterest] = await Promise.all([
      this.getBinanceFunding(),
      this.getBybitFunding(),
      this.getOKXFunding(),
      this.getDeribitFunding(),
      this.getBinanceOpenInterest()
    ]);

    // Adjusted weights when some exchanges fail
    // Binance and Bybit are most reliable
    const weights = {
      binance: 0.6,   // Increased weight as most reliable
      bybit: 0.4,     // Increased weight as second most reliable
      okx: 0.0,       // Often blocked
      deribit: 0.0    // Often has issues
    };

    let weightedSum = 0;
    let totalWeight = 0;

    if (binance) {
      weightedSum += binance.fundingRate * 100;
      totalWeight += weights.binance;
    }
    if (bybit) {
      weightedSum += bybit.fundingRate * 100;
      totalWeight += weights.bybit > 0 ? weights.bybit : 0.4;
    }
    // OKX and Deribit often fail, so we rely mainly on Binance and Bybit
    if (okx && weights.okx > 0) {
      weightedSum += okx.fundingRate * weights.okx * 100;
      totalWeight += weights.okx;
    }
    if (deribit && weights.deribit > 0) {
      weightedSum += deribit.fundingRate * weights.deribit * 100;
      totalWeight += weights.deribit;
    }

    const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Determine signal based on funding rate
    let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
    let confidence = 50;

    if (weightedAverage > 0.05) { // > 0.05% funding rate
      signal = 'sell'; // Overleveraged longs
      confidence = Math.min(60 + weightedAverage * 200, 90);
    } else if (weightedAverage > 0.02) {
      signal = 'neutral';
      confidence = 60;
    } else if (weightedAverage < -0.01) { // Negative funding
      signal = 'buy'; // Overleveraged shorts
      confidence = Math.min(60 + Math.abs(weightedAverage) * 300, 85);
    } else {
      signal = 'neutral';
      confidence = 55;
    }

    return {
      weightedAverage,
      binance: binance?.fundingRate ? binance.fundingRate * 100 : 0,
      bybit: bybit?.fundingRate ? bybit.fundingRate * 100 : 0,
      okx: okx?.fundingRate ? okx.fundingRate * 100 : 0,
      deribit: deribit?.fundingRate ? deribit.fundingRate * 100 : 0,
      signal,
      confidence,
      openInterestUSD: openInterest?.openInterestValue || 0,
      nextFundingTime: binance?.nextFundingTime || Date.now() + (8 * 60 * 60 * 1000)
    };
  }

  // Get historical funding rates for trend analysis
  async getHistoricalFunding(days: number = 7): Promise<Array<{timestamp: number; rate: number}>> {
    try {
      const endTime = Date.now();
      const startTime = endTime - (days * 24 * 60 * 60 * 1000);
      
      const response = await this.binanceClient.get('/fapi/v1/fundingRate', {
        params: {
          symbol: 'BTCUSDT',
          startTime,
          endTime,
          limit: 1000
        }
      });

      return response.data.map((item: {fundingTime: number; fundingRate: string}) => ({
        timestamp: item.fundingTime,
        rate: parseFloat(item.fundingRate) * 100
      }));
    } catch (error) {
      console.error('Error fetching historical funding:', error);
      return [];
    }
  }
}