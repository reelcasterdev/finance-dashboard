import axios from 'axios';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export class CoinGeckoClient {
  private apiKey: string;
  private client;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: COINGECKO_BASE_URL,
      headers: {
        'x-cg-demo-api-key': apiKey,
      },
    });
  }

  async getBitcoinPrice() {
    try {
      const response = await this.client.get('/simple/price', {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true,
        },
      });
      return response.data.bitcoin;
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      throw error;
    }
  }

  async getBitcoinDominance() {
    try {
      const response = await this.client.get('/global');
      return {
        dominance: response.data.data.market_cap_percentage.btc,
        totalMarketCap: response.data.data.total_market_cap.usd,
        totalVolume: response.data.data.total_volume.usd,
      };
    } catch (error) {
      console.error('Error fetching Bitcoin dominance:', error);
      throw error;
    }
  }

  async getHistoricalPrices(days: number = 365) {
    try {
      const response = await this.client.get('/coins/bitcoin/market_chart', {
        params: {
          vs_currency: 'usd',
          days: days,
          interval: 'daily',
        },
      });
      return response.data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp: new Date(timestamp),
        price,
      }));
    } catch (error) {
      console.error('Error fetching historical prices:', error);
      throw error;
    }
  }

  async getFundingRates() {
    try {
      const response = await this.client.get('/derivatives/exchanges');
      const binanceData = response.data.find((exchange: any) => 
        exchange.name.toLowerCase() === 'binance (futures)'
      );
      return {
        openInterest: binanceData?.open_interest_btc || 0,
        volume24h: binanceData?.trade_volume_24h_btc || 0,
      };
    } catch (error) {
      console.error('Error fetching funding rates:', error);
      throw error;
    }
  }

  async getDetailedMarketData() {
    try {
      const response = await this.client.get('/coins/bitcoin', {
        params: {
          localization: false,
          tickers: true,
          market_data: true,
          community_data: false,
          developer_data: false,
          sparkline: true,
        },
      });

      const marketData = response.data.market_data;
      
      return {
        currentPrice: marketData.current_price.usd,
        marketCap: marketData.market_cap.usd,
        totalVolume: marketData.total_volume.usd,
        high24h: marketData.high_24h.usd,
        low24h: marketData.low_24h.usd,
        priceChange24h: marketData.price_change_24h,
        priceChangePercentage24h: marketData.price_change_percentage_24h,
        priceChangePercentage7d: marketData.price_change_percentage_7d,
        priceChangePercentage30d: marketData.price_change_percentage_30d,
        priceChangePercentage1y: marketData.price_change_percentage_1y,
        ath: marketData.ath.usd,
        athDate: marketData.ath_date.usd,
        athChangePercentage: marketData.ath_change_percentage.usd,
        atl: marketData.atl.usd,
        atlDate: marketData.atl_date.usd,
        circulatingSupply: marketData.circulating_supply,
        totalSupply: marketData.total_supply,
        maxSupply: marketData.max_supply,
        sparkline7d: marketData.sparkline_7d.price,
      };
    } catch (error) {
      console.error('Error fetching detailed market data:', error);
      throw error;
    }
  }

  async getOHLCData(days: number = 30) {
    try {
      const response = await this.client.get('/coins/bitcoin/ohlc', {
        params: {
          vs_currency: 'usd',
          days: days,
        },
      });
      
      return response.data.map(([timestamp, open, high, low, close]: number[]) => ({
        timestamp: new Date(timestamp),
        open,
        high,
        low,
        close,
      }));
    } catch (error) {
      console.error('Error fetching OHLC data:', error);
      throw error;
    }
  }

  async getTrendingCoins() {
    try {
      const response = await this.client.get('/search/trending');
      return response.data.coins.map((coin: any) => ({
        id: coin.item.id,
        name: coin.item.name,
        symbol: coin.item.symbol,
        marketCapRank: coin.item.market_cap_rank,
        priceBtc: coin.item.price_btc,
      }));
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      throw error;
    }
  }

  async getExchangeVolumes() {
    try {
      const response = await this.client.get('/exchanges', {
        params: {
          per_page: 10,
          page: 1,
        },
      });
      
      return response.data.map((exchange: any) => ({
        id: exchange.id,
        name: exchange.name,
        btcVolume24h: exchange.trade_volume_24h_btc,
        trustScore: exchange.trust_score,
        year: exchange.year_established,
      }));
    } catch (error) {
      console.error('Error fetching exchange volumes:', error);
      throw error;
    }
  }

  // Get Binance price for Coinbase premium calculation
  async getBinancePrice() {
    try {
      const response = await this.client.get('/coins/bitcoin/tickers', {
        params: {
          exchange_ids: 'binance',
          include_exchange_logo: false,
          page: 1,
          depth: false,
        },
      });
      
      const binanceTicker = response.data.tickers.find(
        (ticker: any) => ticker.base === 'BTC' && ticker.target === 'USDT'
      );
      
      return binanceTicker ? binanceTicker.last : null;
    } catch (error) {
      console.error('Error fetching Binance price:', error);
      throw error;
    }
  }
}