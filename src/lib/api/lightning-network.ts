import axios from 'axios';

interface LightningStats {
  nodeCount: number;
  channelCount: number;
  totalCapacityBTC: number;
  avgCapacityBTC: number;
  avgFeeRate: number;
  avgBaseFeeMsat: number;
  medianCapacityBTC: number;
  torNodes: number;
  clearnetNodes: number;
}

interface LightningNode {
  publicKey: string;
  alias: string;
  capacity: number;
  channelCount: number;
  firstSeen: Date;
  updatedAt: Date;
}

interface LightningGrowth {
  nodesAdded30d: number;
  channelsAdded30d: number;
  capacityAdded30d: number;
  growthRate: number;
}

interface LightningData {
  stats: LightningStats;
  growth: LightningGrowth;
  topNodes: LightningNode[];
  signal: 'bullish' | 'neutral' | 'bearish';
  confidence: number;
  adoptionScore: number;
}

export class LightningNetworkClient {
  private oneMlClient;
  private mempoolClient;
  private ambossClient;
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.oneMlClient = axios.create({
      baseURL: 'https://1ml.com'
    });
    
    this.mempoolClient = axios.create({
      baseURL: 'https://mempool.space'
    });
    
    this.ambossClient = axios.create({
      baseURL: 'https://api.amboss.space'
    });
  }

  // Get Lightning stats from 1ML (free, no key needed)
  async get1MLStats(): Promise<LightningStats | null> {
    const cacheKey = '1ml_stats';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as LightningStats | null;
    }

    try {
      const response = await this.oneMlClient.get('/api/v1/network/stats');
      const stats = response.data;
      
      const data: LightningStats = {
        nodeCount: stats.node_count || 0,
        channelCount: stats.channel_count || 0,
        totalCapacityBTC: stats.total_capacity ? stats.total_capacity / 100000000 : 0,
        avgCapacityBTC: stats.avg_capacity ? stats.avg_capacity / 100000000 : 0,
        avgFeeRate: stats.avg_fee_rate || 0,
        avgBaseFeeMsat: stats.avg_base_fee || 0,
        medianCapacityBTC: stats.median_capacity ? stats.median_capacity / 100000000 : 0,
        torNodes: stats.tor_nodes || 0,
        clearnetNodes: stats.clearnet_nodes || 0
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching 1ML stats:', error);
      return null;
    }
  }

  // Get Lightning stats from mempool.space (alternative free source)
  async getMempoolLightningStats(): Promise<LightningStats | null> {
    const cacheKey = 'mempool_lightning_stats';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as LightningStats | null;
    }

    try {
      const response = await this.mempoolClient.get('/api/v1/lightning/statistics/latest');
      const stats = response.data.latest || response.data;
      
      const data: LightningStats = {
        nodeCount: stats.node_count || 0,
        channelCount: stats.channel_count || 0,
        totalCapacityBTC: stats.total_capacity || 0,
        avgCapacityBTC: stats.avg_capacity || 0,
        avgFeeRate: stats.avg_fee_rate || 0,
        avgBaseFeeMsat: stats.avg_base_fee_mtokens || 0,
        medianCapacityBTC: stats.med_capacity || 0,
        torNodes: stats.tor_nodes || 0,
        clearnetNodes: stats.clearnet_nodes || 0
      };

      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching mempool Lightning stats:', error);
      return null;
    }
  }

  // Get top Lightning nodes
  async getTopNodes(limit: number = 10): Promise<LightningNode[]> {
    const cacheKey = `top_nodes_${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as LightningNode[];
    }

    try {
      // 1ML API endpoint has changed, using a different approach
      // For now, return sample data or empty array
      // Alternative: use mempool.space or Amboss API if available
      
      // Return empty array for now as 1ML API is not accessible
      // You could integrate Amboss API here if you have a key
      return [];
      
      /* Original implementation for reference
      const response = await this.oneMlClient.get('/api/v1/node/top', {
        params: { 
          limit,
          sortBy: 'capacity'
        }
      });
      
      const nodes: LightningNode[] = response.data.map((node: any) => ({
        publicKey: node.pub_key,
        alias: node.alias || 'Unknown',
        capacity: node.capacity / 100000000, // Convert to BTC
        channelCount: node.channel_count,
        firstSeen: new Date(node.first_seen),
        updatedAt: new Date(node.updated_at)
      }));

      this.cache.set(cacheKey, { data: nodes, timestamp: Date.now() });
      return nodes;
      */
    } catch (error) {
      console.error('Error fetching top nodes:', error);
      return [];
    }
  }

  // Calculate Lightning Network growth
  async calculateGrowth(): Promise<LightningGrowth> {
    try {
      // Get historical data from mempool.space
      const response = await this.mempoolClient.get('/api/v1/lightning/statistics/3m');
      const data = response.data;
      
      if (!data || data.length < 2) {
        return {
          nodesAdded30d: 0,
          channelsAdded30d: 0,
          capacityAdded30d: 0,
          growthRate: 0
        };
      }
      
      // Compare latest with 30 days ago (approximately)
      const latest = data[data.length - 1];
      const thirtyDaysAgo = data[Math.max(0, data.length - 30)];
      
      const nodesAdded = latest.node_count - thirtyDaysAgo.node_count;
      const channelsAdded = latest.channel_count - thirtyDaysAgo.channel_count;
      const capacityAdded = latest.total_capacity - thirtyDaysAgo.total_capacity;
      const growthRate = ((latest.total_capacity - thirtyDaysAgo.total_capacity) / thirtyDaysAgo.total_capacity) * 100;
      
      return {
        nodesAdded30d: nodesAdded,
        channelsAdded30d: channelsAdded,
        capacityAdded30d: capacityAdded,
        growthRate
      };
    } catch (error) {
      console.error('Error calculating Lightning growth:', error);
      return {
        nodesAdded30d: 0,
        channelsAdded30d: 0,
        capacityAdded30d: 0,
        growthRate: 0
      };
    }
  }

  // Get comprehensive Lightning Network data
  async getLightningData(): Promise<LightningData> {
    // Try multiple sources for redundancy
    let stats = await this.getMempoolLightningStats();
    if (!stats) {
      stats = await this.get1MLStats();
    }
    
    if (!stats) {
      // Return default values if both sources fail
      return {
        stats: {
          nodeCount: 0,
          channelCount: 0,
          totalCapacityBTC: 0,
          avgCapacityBTC: 0,
          avgFeeRate: 0,
          avgBaseFeeMsat: 0,
          medianCapacityBTC: 0,
          torNodes: 0,
          clearnetNodes: 0
        },
        growth: {
          nodesAdded30d: 0,
          channelsAdded30d: 0,
          capacityAdded30d: 0,
          growthRate: 0
        },
        topNodes: [],
        signal: 'neutral',
        confidence: 50,
        adoptionScore: 50
      };
    }
    
    const [growth, topNodes] = await Promise.all([
      this.calculateGrowth(),
      this.getTopNodes(10)
    ]);
    
    // Calculate adoption score (0-100)
    let adoptionScore = 50;
    
    // Node count factor (10k nodes = 50 points)
    adoptionScore += Math.min((stats.nodeCount / 10000) * 25, 25);
    
    // Capacity factor (5000 BTC = 25 points)
    adoptionScore += Math.min((stats.totalCapacityBTC / 5000) * 25, 25);
    
    // Determine signal based on growth and adoption
    let signal: 'bullish' | 'neutral' | 'bearish' = 'neutral';
    let confidence = 50;
    
    if (growth.growthRate > 10 && adoptionScore > 70) {
      signal = 'bullish';
      confidence = Math.min(60 + growth.growthRate, 85);
    } else if (growth.growthRate < -5 || adoptionScore < 40) {
      signal = 'bearish';
      confidence = 65;
    } else {
      signal = 'neutral';
      confidence = 55;
    }
    
    return {
      stats,
      growth,
      topNodes,
      signal,
      confidence,
      adoptionScore: Math.min(Math.max(adoptionScore, 0), 100)
    };
  }

  // Get routing fees trend
  async getRoutingFeesTrend(): Promise<{avgFeeRate: number; avgBaseFee: number; trend: string; congestionLevel: string} | null> {
    try {
      const stats = await this.getMempoolLightningStats();
      if (!stats) return null;
      
      return {
        avgFeeRate: stats.avgFeeRate,
        avgBaseFee: stats.avgBaseFeeMsat,
        trend: stats.avgFeeRate > 1000 ? 'increasing' : 
               stats.avgFeeRate < 100 ? 'decreasing' : 'stable',
        congestionLevel: stats.avgFeeRate > 2000 ? 'high' : 
                        stats.avgFeeRate > 500 ? 'medium' : 'low'
      };
    } catch (error) {
      console.error('Error getting routing fees trend:', error);
      return null;
    }
  }
}