import axios from 'axios';

const MEMPOOL_BASE_URL = 'https://mempool.space/api';

export class MempoolSpaceClient {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: MEMPOOL_BASE_URL,
    });
  }

  // Get recommended fees
  async getRecommendedFees() {
    try {
      const response = await this.client.get('/v1/fees/recommended');
      return {
        fastestFee: response.data.fastestFee,
        halfHourFee: response.data.halfHourFee,
        hourFee: response.data.hourFee,
        economyFee: response.data.economyFee,
        minimumFee: response.data.minimumFee,
      };
    } catch (error) {
      console.error('Error fetching recommended fees:', error);
      throw error;
    }
  }

  // Get mempool statistics
  async getMempoolStats() {
    try {
      const response = await this.client.get('/mempool');
      return {
        count: response.data.count || 0,
        vsize: response.data.vsize || 0,
        totalFee: response.data.total_fee || 0,
        feeHistogram: response.data.fee_histogram || [],
      };
    } catch (error) {
      console.error('Error fetching mempool stats:', error);
      // Return default values if API fails
      return {
        count: 0,
        vsize: 0,
        totalFee: 0,
        feeHistogram: [],
      };
    }
  }

  // Get recent blocks
  async getRecentBlocks() {
    try {
      const response = await this.client.get('/v1/blocks');
      return response.data.slice(0, 10).map((block: any) => ({
        id: block.id,
        height: block.height,
        timestamp: block.timestamp,
        txCount: block.tx_count,
        size: block.size,
        weight: block.weight,
        fee: block.fee,
      }));
    } catch (error) {
      console.error('Error fetching recent blocks:', error);
      // Return empty array if API fails
      return [];
    }
  }

  // Get network difficulty adjustment
  async getDifficultyAdjustment() {
    try {
      const response = await this.client.get('/v1/difficulty-adjustment');
      return {
        progressPercent: response.data.progressPercent || 0,
        difficultyChange: response.data.difficultyChange || 0,
        estimatedRetargetDate: response.data.estimatedRetargetDate || Date.now(),
        remainingBlocks: response.data.remainingBlocks || 0,
        remainingTime: response.data.remainingTime || 0,
        previousRetarget: response.data.previousRetarget || 0,
        nextRetargetHeight: response.data.nextRetargetHeight || 0,
      };
    } catch (error) {
      console.error('Error fetching difficulty adjustment:', error);
      // Return default values if API fails
      return {
        progressPercent: 50,
        difficultyChange: 0,
        estimatedRetargetDate: Date.now(),
        remainingBlocks: 1000,
        remainingTime: 0,
        previousRetarget: 0,
        nextRetargetHeight: 0,
      };
    }
  }

  // Get Lightning Network statistics
  async getLightningStats() {
    try {
      const response = await this.client.get('/v1/lightning/statistics/latest');
      return {
        nodeCount: response.data.latest.node_count,
        channelCount: response.data.latest.channel_count,
        totalCapacity: response.data.latest.total_capacity,
        avgCapacity: response.data.latest.avg_capacity,
        avgFeeRate: response.data.latest.avg_fee_rate,
        avgBaseFeeMtokens: response.data.latest.avg_base_fee_mtokens,
      };
    } catch (error) {
      console.error('Error fetching Lightning stats:', error);
      // Return null if Lightning stats not available
      return null;
    }
  }

  // Calculate fee pressure indicator
  calculateFeePressure(fees: any) {
    // High fees indicate high demand and potential market top
    const avgFee = (fees.fastestFee + fees.halfHourFee + fees.hourFee) / 3;
    
    let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
    let confidence = 50;
    
    if (avgFee > 100) {
      // Very high fees - potential peak
      signal = 'sell';
      confidence = 70;
    } else if (avgFee > 50) {
      // Elevated fees
      signal = 'sell';
      confidence = 60;
    } else if (avgFee < 10) {
      // Low fees - potential bottom
      signal = 'buy';
      confidence = 60;
    } else if (avgFee < 5) {
      signal = 'buy';
      confidence = 70;
    }
    
    return {
      avgFee,
      signal,
      confidence,
      description: `Avg fee: ${avgFee} sat/vB`,
    };
  }

  // Calculate network congestion score
  calculateCongestion(mempoolStats: any, fees: any) {
    let congestionScore = 0;
    
    // Factor 1: Transaction count in mempool
    if (mempoolStats.count > 100000) {
      congestionScore += 40;
    } else if (mempoolStats.count > 50000) {
      congestionScore += 30;
    } else if (mempoolStats.count > 20000) {
      congestionScore += 20;
    } else if (mempoolStats.count > 10000) {
      congestionScore += 10;
    }
    
    // Factor 2: Memory pool size
    const vsizeMB = mempoolStats.vsize / 1000000;
    if (vsizeMB > 300) {
      congestionScore += 30;
    } else if (vsizeMB > 150) {
      congestionScore += 20;
    } else if (vsizeMB > 50) {
      congestionScore += 10;
    }
    
    // Factor 3: Fee levels
    if (fees.fastestFee > 100) {
      congestionScore += 30;
    } else if (fees.fastestFee > 50) {
      congestionScore += 20;
    } else if (fees.fastestFee > 20) {
      congestionScore += 10;
    }
    
    return {
      score: Math.min(100, congestionScore),
      level: congestionScore > 70 ? 'high' : congestionScore > 40 ? 'moderate' : 'low',
      signal: congestionScore > 70 ? 'sell' : congestionScore < 30 ? 'buy' : 'neutral',
    };
  }
}