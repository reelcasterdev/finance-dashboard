import axios from 'axios';
import crypto from 'crypto';

const COINBASE_BASE_URL = 'https://api.coinbase.com';
const COINBASE_PRO_BASE_URL = 'https://api.exchange.coinbase.com';

export class CoinbaseClient {
  private apiKey: string;
  private apiSecret: string;
  private client;
  private proClient;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    
    this.client = axios.create({
      baseURL: COINBASE_BASE_URL,
    });

    this.proClient = axios.create({
      baseURL: COINBASE_PRO_BASE_URL,
    });
  }

  private generateSignature(
    timestamp: string,
    method: string,
    path: string,
    body: string = ''
  ): string {
    const message = timestamp + method + path + body;
    const key = Buffer.from(this.apiSecret, 'base64');
    const hmac = crypto.createHmac('sha256', key);
    const signature = hmac.update(message).digest('base64');
    return signature;
  }

  private getHeaders(method: string, path: string, body?: unknown): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const bodyStr = body ? JSON.stringify(body) : '';
    const signature = this.generateSignature(timestamp, method, path, bodyStr);

    return {
      'CB-ACCESS-KEY': this.apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-VERSION': '2024-01-01',
      'Content-Type': 'application/json',
    };
  }

  async getBitcoinPrice() {
    try {
      const path = '/v2/exchange-rates?currency=BTC';
      const response = await this.client.get(path, {
        headers: this.getHeaders('GET', path),
      });
      
      return {
        usd: parseFloat(response.data.data.rates.USD),
        eur: parseFloat(response.data.data.rates.EUR),
        gbp: parseFloat(response.data.data.rates.GBP),
      };
    } catch (error) {
      console.error('Error fetching Bitcoin price from Coinbase:', error);
      throw error;
    }
  }

  async getSpotPrice(pair: string = 'BTC-USD') {
    try {
      const path = `/v2/prices/${pair}/spot`;
      const response = await this.client.get(path, {
        headers: this.getHeaders('GET', path),
      });
      
      return {
        amount: parseFloat(response.data.data.amount),
        currency: response.data.data.currency,
      };
    } catch (error) {
      console.error('Error fetching spot price:', error);
      throw error;
    }
  }

  async getBuyPrice(pair: string = 'BTC-USD') {
    try {
      const path = `/v2/prices/${pair}/buy`;
      const response = await this.client.get(path, {
        headers: this.getHeaders('GET', path),
      });
      
      return {
        amount: parseFloat(response.data.data.amount),
        currency: response.data.data.currency,
      };
    } catch (error) {
      console.error('Error fetching buy price:', error);
      throw error;
    }
  }

  async getSellPrice(pair: string = 'BTC-USD') {
    try {
      const path = `/v2/prices/${pair}/sell`;
      const response = await this.client.get(path, {
        headers: this.getHeaders('GET', path),
      });
      
      return {
        amount: parseFloat(response.data.data.amount),
        currency: response.data.data.currency,
      };
    } catch (error) {
      console.error('Error fetching sell price:', error);
      throw error;
    }
  }

  // Calculate Coinbase Premium (Coinbase price vs other exchanges)
  async getCoinbasePremium(binancePrice: number) {
    try {
      const coinbasePrice = await this.getSpotPrice();
      const premium = ((coinbasePrice.amount - binancePrice) / binancePrice) * 100;
      
      return {
        coinbasePrice: coinbasePrice.amount,
        binancePrice,
        premium,
        signal: this.getPremiumSignal(premium),
      };
    } catch (error) {
      console.error('Error calculating Coinbase premium:', error);
      throw error;
    }
  }

  private getPremiumSignal(premium: number): 'buy' | 'neutral' | 'sell' {
    if (premium > 1) return 'buy'; // Positive premium indicates US buying pressure
    if (premium < -1) return 'sell'; // Negative premium indicates US selling pressure
    return 'neutral';
  }

  // Get 24h stats for Bitcoin
  async get24HourStats() {
    try {
      const path = '/products/BTC-USD/stats';
      const response = await this.proClient.get(path);
      
      return {
        open: parseFloat(response.data.open),
        high: parseFloat(response.data.high),
        low: parseFloat(response.data.low),
        last: parseFloat(response.data.last),
        volume: parseFloat(response.data.volume),
        volume30Day: parseFloat(response.data.volume_30day),
      };
    } catch (error) {
      console.error('Error fetching 24h stats:', error);
      throw error;
    }
  }

  // Get order book for market depth analysis
  async getOrderBook(level: number = 2) {
    try {
      const path = `/products/BTC-USD/book?level=${level}`;
      const response = await this.proClient.get(path);
      
      const bids = response.data.bids.map((bid: [string, string]) => ({
        price: parseFloat(bid[0]),
        size: parseFloat(bid[1]),
      }));
      
      const asks = response.data.asks.map((ask: [string, string]) => ({
        price: parseFloat(ask[0]),
        size: parseFloat(ask[1]),
      }));
      
      // Calculate bid/ask ratio for market sentiment
      const totalBidVolume = bids.reduce((sum: number, bid: { size: number }) => sum + bid.size, 0);
      const totalAskVolume = asks.reduce((sum: number, ask: { size: number }) => sum + ask.size, 0);
      const bidAskRatio = totalBidVolume / totalAskVolume;
      
      return {
        bids: bids.slice(0, 10), // Top 10 bids
        asks: asks.slice(0, 10), // Top 10 asks
        spread: asks[0].price - bids[0].price,
        bidAskRatio,
        marketSentiment: this.getMarketSentiment(bidAskRatio),
      };
    } catch (error) {
      console.error('Error fetching order book:', error);
      throw error;
    }
  }

  private getMarketSentiment(ratio: number): 'bullish' | 'neutral' | 'bearish' {
    if (ratio > 1.2) return 'bullish';
    if (ratio < 0.8) return 'bearish';
    return 'neutral';
  }

  // Get recent trades for volume analysis
  async getRecentTrades(limit: number = 100) {
    try {
      const path = `/products/BTC-USD/trades?limit=${limit}`;
      const response = await this.proClient.get(path);
      
      const trades = response.data.map((trade: { price: string; size: string; time: string; side: string }) => ({
        time: new Date(trade.time),
        price: parseFloat(trade.price),
        size: parseFloat(trade.size),
        side: trade.side,
      }));
      
      // Calculate buy/sell pressure
      const buyVolume = trades
        .filter((t: { side: string }) => t.side === 'buy')
        .reduce((sum: number, t: { size: number }) => sum + t.size, 0);
      
      const sellVolume = trades
        .filter((t: { side: string }) => t.side === 'sell')
        .reduce((sum: number, t: { size: number }) => sum + t.size, 0);
      
      return {
        trades: trades.slice(0, 20), // Last 20 trades
        buyVolume,
        sellVolume,
        buyPressure: (buyVolume / (buyVolume + sellVolume)) * 100,
        volumeSignal: this.getVolumeSignal(buyVolume, sellVolume),
      };
    } catch (error) {
      console.error('Error fetching recent trades:', error);
      throw error;
    }
  }

  private getVolumeSignal(buyVolume: number, sellVolume: number): 'buy' | 'neutral' | 'sell' {
    const ratio = buyVolume / sellVolume;
    if (ratio > 1.3) return 'buy';
    if (ratio < 0.7) return 'sell';
    return 'neutral';
  }
}