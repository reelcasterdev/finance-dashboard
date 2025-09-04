import axios from 'axios';

interface ExchangePrice {
  exchange: string;
  price: number;
  volume24h: number;
  bid: number;
  ask: number;
  spread: number;
  timestamp: Date;
}

interface PremiumData {
  coinbasePremium: number;
  krakenPremium: number;
  bitstampPremium: number;
  usPremium: number; // Weighted US premium
  koreanPremium: number | null;
  japanPremium: number | null;
  signal: 'buy' | 'neutral' | 'sell';
  confidence: number;
  dominantExchange: string;
}

export class MultiExchangeClient {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private CACHE_DURATION = 30 * 1000; // 30 seconds for price data

  constructor() {}

  // Get Binance price (global baseline)
  async getBinancePrice(): Promise<ExchangePrice | null> {
    const cacheKey = 'binance_price';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as ExchangePrice | null;
    }

    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr', {
        params: { symbol: 'BTCUSDT' }
      });

      const data: ExchangePrice = {
        exchange: 'Binance',
        price: parseFloat(response.data.lastPrice),
        volume24h: parseFloat(response.data.volume) * parseFloat(response.data.lastPrice),
        bid: parseFloat(response.data.bidPrice),
        ask: parseFloat(response.data.askPrice),
        spread: parseFloat(response.data.askPrice) - parseFloat(response.data.bidPrice),
        timestamp: new Date()
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching Binance price:', error);
      return null;
    }
  }

  // Get Coinbase price (US institutional)
  async getCoinbasePrice(): Promise<ExchangePrice | null> {
    const cacheKey = 'coinbase_price';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as ExchangePrice | null;
    }

    try {
      const [tickerResponse, statsResponse] = await Promise.all([
        axios.get('https://api.coinbase.com/v2/exchange-rates', {
          params: { currency: 'BTC' }
        }),
        axios.get('https://api.exchange.coinbase.com/products/BTC-USD/stats')
      ]);

      const price = parseFloat(tickerResponse.data.data.rates.USD);
      const stats = statsResponse.data;
      
      const data: ExchangePrice = {
        exchange: 'Coinbase',
        price,
        volume24h: parseFloat(stats.volume) * price,
        bid: price - 10, // Approximate
        ask: price + 10, // Approximate
        spread: 20,
        timestamp: new Date()
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching Coinbase price:', error);
      return null;
    }
  }

  // Get Kraken price (US/EU)
  async getKrakenPrice(): Promise<ExchangePrice | null> {
    const cacheKey = 'kraken_price';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as ExchangePrice | null;
    }

    try {
      const response = await axios.get('https://api.kraken.com/0/public/Ticker', {
        params: { pair: 'XBTUSD' }
      });

      const ticker = response.data.result.XXBTZUSD;
      
      const data: ExchangePrice = {
        exchange: 'Kraken',
        price: parseFloat(ticker.c[0]), // Last trade price
        volume24h: parseFloat(ticker.v[1]) * parseFloat(ticker.c[0]), // 24h volume
        bid: parseFloat(ticker.b[0]),
        ask: parseFloat(ticker.a[0]),
        spread: parseFloat(ticker.a[0]) - parseFloat(ticker.b[0]),
        timestamp: new Date()
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching Kraken price:', error);
      return null;
    }
  }

  // Get Bitstamp price (EU)
  async getBitstampPrice(): Promise<ExchangePrice | null> {
    const cacheKey = 'bitstamp_price';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as ExchangePrice | null;
    }

    try {
      const response = await axios.get('https://www.bitstamp.net/api/v2/ticker/btcusd');

      const data: ExchangePrice = {
        exchange: 'Bitstamp',
        price: parseFloat(response.data.last),
        volume24h: parseFloat(response.data.volume) * parseFloat(response.data.last),
        bid: parseFloat(response.data.bid),
        ask: parseFloat(response.data.ask),
        spread: parseFloat(response.data.ask) - parseFloat(response.data.bid),
        timestamp: new Date(parseInt(response.data.timestamp) * 1000)
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching Bitstamp price:', error);
      return null;
    }
  }

  // Get Upbit price (Korean exchange) for Kimchi premium
  async getUpbitPrice(): Promise<ExchangePrice | null> {
    const cacheKey = 'upbit_price';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as ExchangePrice | null;
    }

    try {
      // Get BTC-KRW price
      const response = await axios.get('https://api.upbit.com/v1/ticker', {
        params: { markets: 'KRW-BTC' }
      });

      // Get USD-KRW exchange rate (simplified - you might want to use a forex API)
      const usdKrw = 1300; // Approximate exchange rate
      
      const krwPrice = response.data[0].trade_price;
      const usdPrice = krwPrice / usdKrw;
      
      const data: ExchangePrice = {
        exchange: 'Upbit',
        price: usdPrice,
        volume24h: response.data[0].acc_trade_volume_24h * usdPrice,
        bid: usdPrice - 20,
        ask: usdPrice + 20,
        spread: 40,
        timestamp: new Date(response.data[0].timestamp)
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching Upbit price:', error);
      return null;
    }
  }

  // Get Bitflyer price (Japanese exchange)
  async getBitflyerPrice(): Promise<ExchangePrice | null> {
    const cacheKey = 'bitflyer_price';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as ExchangePrice | null;
    }

    try {
      // Get BTC-JPY price
      const response = await axios.get('https://api.bitflyer.com/v1/ticker', {
        params: { product_code: 'BTC_JPY' }
      });

      // Get USD-JPY exchange rate (simplified)
      const usdJpy = 150; // Approximate exchange rate
      
      const jpyPrice = response.data.ltp;
      const usdPrice = jpyPrice / usdJpy;
      
      const data: ExchangePrice = {
        exchange: 'Bitflyer',
        price: usdPrice,
        volume24h: response.data.volume * usdPrice,
        bid: response.data.best_bid / usdJpy,
        ask: response.data.best_ask / usdJpy,
        spread: (response.data.best_ask - response.data.best_bid) / usdJpy,
        timestamp: new Date(response.data.timestamp)
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching Bitflyer price:', error);
      return null;
    }
  }

  // Calculate all premiums
  async calculatePremiums(): Promise<PremiumData> {
    // Fetch all prices in parallel
    const [binance, coinbase, kraken, bitstamp, upbit, bitflyer] = await Promise.all([
      this.getBinancePrice(),
      this.getCoinbasePrice(),
      this.getKrakenPrice(),
      this.getBitstampPrice(),
      this.getUpbitPrice(),
      this.getBitflyerPrice()
    ]);

    // Use Binance as global baseline
    const basePrice = binance?.price || 50000;
    
    // Calculate individual premiums
    const coinbasePremium = coinbase ? ((coinbase.price - basePrice) / basePrice) * 100 : 0;
    const krakenPremium = kraken ? ((kraken.price - basePrice) / basePrice) * 100 : 0;
    const bitstampPremium = bitstamp ? ((bitstamp.price - basePrice) / basePrice) * 100 : 0;
    
    // Calculate weighted US premium (Coinbase 60%, Kraken 40%)
    const usPremium = coinbase && kraken 
      ? ((coinbase.price * 0.6 + kraken.price * 0.4 - basePrice) / basePrice) * 100
      : coinbasePremium;
    
    // Calculate Korean premium (Kimchi premium)
    const koreanPremium = upbit ? ((upbit.price - basePrice) / basePrice) * 100 : null;
    
    // Calculate Japanese premium
    const japanPremium = bitflyer ? ((bitflyer.price - basePrice) / basePrice) * 100 : null;
    
    // Determine signal based on premiums
    let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
    let confidence = 50;
    
    // US premium signals institutional demand
    if (usPremium > 0.5) {
      signal = 'buy';
      confidence = Math.min(60 + usPremium * 10, 80);
    } else if (usPremium < -0.5) {
      signal = 'sell';
      confidence = Math.min(60 + Math.abs(usPremium) * 10, 75);
    }
    
    // Korean premium extreme values are significant
    if (koreanPremium && koreanPremium > 5) {
      signal = 'sell'; // Extreme greed in retail
      confidence = Math.min(70 + koreanPremium, 90);
    } else if (koreanPremium && koreanPremium < -3) {
      signal = 'buy'; // Extreme fear
      confidence = 75;
    }
    
    // Find dominant exchange by volume
    const exchanges = [
      { name: 'Binance', volume: binance?.volume24h || 0 },
      { name: 'Coinbase', volume: coinbase?.volume24h || 0 },
      { name: 'Kraken', volume: kraken?.volume24h || 0 },
      { name: 'Bitstamp', volume: bitstamp?.volume24h || 0 }
    ];
    
    const dominantExchange = exchanges.reduce((max, ex) => 
      ex.volume > max.volume ? ex : max
    ).name;
    
    return {
      coinbasePremium,
      krakenPremium,
      bitstampPremium,
      usPremium,
      koreanPremium,
      japanPremium,
      signal,
      confidence,
      dominantExchange
    };
  }

  // Get spread analysis across exchanges
  async getSpreadAnalysis(): Promise<{maxPrice: number; minPrice: number; avgPrice: number; spread: number; spreadPercentage: number; exchanges: Array<{exchange: string; price: number; deviation: number}>} | null> {
    const prices = await Promise.all([
      this.getBinancePrice(),
      this.getCoinbasePrice(),
      this.getKrakenPrice(),
      this.getBitstampPrice()
    ]);
    
    const validPrices = prices.filter(p => p !== null) as ExchangePrice[];
    
    if (validPrices.length === 0) {
      return null;
    }
    
    const priceValues = validPrices.map(p => p.price);
    const maxPrice = Math.max(...priceValues);
    const minPrice = Math.min(...priceValues);
    const avgPrice = priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length;
    
    return {
      maxPrice,
      minPrice,
      avgPrice,
      spread: maxPrice - minPrice,
      spreadPercentage: ((maxPrice - minPrice) / avgPrice) * 100,
      exchanges: validPrices.map(p => ({
        exchange: p.exchange,
        price: p.price,
        deviation: ((p.price - avgPrice) / avgPrice) * 100
      }))
    };
  }
}