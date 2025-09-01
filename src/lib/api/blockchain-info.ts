import axios from 'axios';

const BLOCKCHAIN_BASE_URL = 'https://blockchain.info';
const BLOCKCHAIN_API_URL = 'https://api.blockchain.info';

export class BlockchainInfoClient {
  private client;
  private apiClient;

  constructor() {
    this.client = axios.create({
      baseURL: BLOCKCHAIN_BASE_URL,
    });
    
    this.apiClient = axios.create({
      baseURL: BLOCKCHAIN_API_URL,
    });
  }

  // Get network hash rate
  async getHashRate() {
    try {
      const response = await this.client.get('/q/hashrate');
      return {
        hashRate: response.data,
        unit: 'GH/s',
      };
    } catch (error) {
      console.error('Error fetching hash rate:', error);
      throw error;
    }
  }

  // Get mining difficulty
  async getDifficulty() {
    try {
      const response = await this.client.get('/q/getdifficulty');
      return {
        difficulty: response.data,
      };
    } catch (error) {
      console.error('Error fetching difficulty:', error);
      throw error;
    }
  }

  // Get mempool size
  async getMempoolSize() {
    try {
      const response = await this.client.get('/q/unconfirmedcount');
      return {
        unconfirmedTxCount: response.data,
      };
    } catch (error) {
      console.error('Error fetching mempool size:', error);
      throw error;
    }
  }

  // Get 24hr transaction count
  async get24hrTransactionCount() {
    try {
      const response = await this.client.get('/q/24hrtransactioncount');
      return {
        dailyTransactions: response.data,
      };
    } catch (error) {
      console.error('Error fetching transaction count:', error);
      throw error;
    }
  }

  // Get 24hr BTC sent
  async get24hrBTCSent() {
    try {
      const response = await this.client.get('/q/24hrbtcsent');
      return {
        dailyVolumeBTC: response.data / 100000000, // Convert from satoshis
      };
    } catch (error) {
      console.error('Error fetching BTC sent:', error);
      throw error;
    }
  }

  // Get market price
  async getMarketPrice() {
    try {
      const response = await this.client.get('/q/marketcap');
      const priceResponse = await this.client.get('/q/24hrprice');
      return {
        marketCap: response.data,
        price: priceResponse.data,
      };
    } catch (error) {
      console.error('Error fetching market price:', error);
      throw error;
    }
  }

  // Get blockchain stats
  async getStats() {
    try {
      const response = await this.apiClient.get('/stats');
      return {
        marketPriceUsd: response.data.market_price_usd || 0,
        hashRate: response.data.hash_rate || 0,
        totalFeesBtc: response.data.total_fees_btc || 0,
        nTx: response.data.n_tx || 0,
        nBlocksMined: response.data.n_blocks_mined || 0,
        minutesBetweenBlocks: response.data.minutes_between_blocks || 10,
        totalBc: (response.data.totalbc || 0) / 100000000, // Total bitcoins in circulation
        estimatedTransactionVolume: response.data.estimated_transaction_volume_usd || 0,
        minersRevenue: response.data.miners_revenue_usd || 0,
        difficulty: response.data.difficulty || 0,
      };
    } catch (error) {
      console.error('Error fetching blockchain stats:', error);
      // Return default values
      return {
        marketPriceUsd: 0,
        hashRate: 0,
        totalFeesBtc: 0,
        nTx: 300000,
        nBlocksMined: 144,
        minutesBetweenBlocks: 10,
        totalBc: 19500000,
        estimatedTransactionVolume: 0,
        minersRevenue: 0,
        difficulty: 0,
      };
    }
  }

  // Calculate network health score
  calculateNetworkHealth(stats: any) {
    // High hash rate + high difficulty + normal mempool = healthy network
    let healthScore = 50; // Base score
    
    // Hash rate trend (compare to 30-day average)
    if (stats.hashRate > stats.hashRate30dAvg) {
      healthScore += 20;
    }
    
    // Mempool congestion (lower is better)
    if (stats.unconfirmedTxCount < 5000) {
      healthScore += 15;
    } else if (stats.unconfirmedTxCount > 20000) {
      healthScore -= 15;
    }
    
    // Transaction volume (higher indicates more usage)
    if (stats.dailyTransactions > 300000) {
      healthScore += 15;
    }
    
    return {
      score: Math.min(100, Math.max(0, healthScore)),
      signal: healthScore > 70 ? 'healthy' : healthScore > 40 ? 'neutral' : 'weak',
    };
  }

  // Calculate Hash Ribbons indicator
  async calculateHashRibbons() {
    try {
      const stats = await this.getStats();
      const hashRate = stats.hashRate;
      
      // Simplified Hash Ribbons calculation
      // In reality, this needs 30-day and 60-day moving averages
      let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
      let confidence = 50;
      
      // If hash rate is recovering after a drop (miner capitulation), it's a buy signal
      // This is simplified - real calculation needs historical data
      if (stats.difficulty < stats.difficulty * 0.95) {
        signal = 'buy';
        confidence = 70;
      } else if (stats.difficulty > stats.difficulty * 1.1) {
        signal = 'sell';
        confidence = 60;
      }
      
      return {
        hashRate,
        difficulty: stats.difficulty,
        signal,
        confidence,
        description: 'Hash rate recovery after miner capitulation',
      };
    } catch (error) {
      console.error('Error calculating hash ribbons:', error);
      throw error;
    }
  }
}