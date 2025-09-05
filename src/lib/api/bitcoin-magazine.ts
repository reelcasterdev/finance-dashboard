import axios from 'axios';

// Bitcoin Magazine Pro API Types
interface BMProIndicator {
  value: number;
  timestamp: Date;
  signal?: 'buy' | 'neutral' | 'sell';
  confidence?: number;
}

interface MVRVData extends BMProIndicator {
  zScore: number;
  ratio: number;
}

interface LTHSupplyData extends BMProIndicator {
  lthSupply: number;
  sthSupply: number;
  lthPercentage: number;
  sthPercentage: number;
  netPosition: 'accumulation' | 'distribution' | 'neutral';
}

interface PuellMultipleData extends BMProIndicator {
  multiple: number;
  minerRevenue: number;
  ma365: number;
}

interface MinerData extends BMProIndicator {
  hashRate: number;
  difficulty: number;
  minerRevenue: number;
  minerOutflow?: number;
  mpi?: number; // Miner Position Index
  hashRibbons?: {
    buy: boolean;
    capitulation: boolean;
    recovery: boolean;
  };
}

interface NUPLData extends BMProIndicator {
  nupl: number;
  marketPhase: 'euphoria' | 'belief' | 'optimism' | 'hope' | 'fear' | 'capitulation';
}

interface RHODLData extends BMProIndicator {
  ratio: number;
  rhodlRatio: number;
}

interface ReserveRiskData extends BMProIndicator {
  risk: number;
  opportunity: 'high' | 'medium' | 'low';
}

export class BitcoinMagazineClient {
  private client;
  private apiKey?: string;
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
    
    // Note: Actual Bitcoin Magazine Pro API endpoint would be different
    // This is a placeholder - you'll need to update with actual API URL
    this.client = axios.create({
      baseURL: 'https://api.bitcoinmagazinepro.com/v1', // Update with actual URL
      headers: apiKey ? {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      } : {}
    });
  }

  // Get MVRV Z-Score
  async getMVRV(): Promise<MVRVData> {
    const cacheKey = 'mvrv';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as MVRVData;
    }

    try {
      const response = await this.client.get('/indicators/mvrv-zscore');
      
      const mvrv = response.data.value || response.data.mvrv || 2.5;
      const zScore = response.data.zScore || response.data.z_score || 1.5;
      
      // Determine signal based on MVRV Z-Score
      let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
      let confidence = 50;
      
      if (zScore > 7) {
        signal = 'sell';
        confidence = 90;
      } else if (zScore > 5) {
        signal = 'sell';
        confidence = 70;
      } else if (zScore < 0) {
        signal = 'buy';
        confidence = 85;
      } else if (zScore < 1) {
        signal = 'buy';
        confidence = 65;
      }
      
      const data: MVRVData = {
        value: mvrv,
        ratio: mvrv,
        zScore,
        signal,
        confidence,
        timestamp: new Date()
      };
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      console.warn('Failed to fetch MVRV from Bitcoin Magazine Pro, using fallback');
      // Fallback to calculated or default values
      return {
        value: 2.3,
        ratio: 2.3,
        zScore: 1.5,
        signal: 'neutral',
        confidence: 50,
        timestamp: new Date()
      };
    }
  }

  // Get Long-Term Holder Supply
  async getLTHSupply(): Promise<LTHSupplyData> {
    const cacheKey = 'lth_supply';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as LTHSupplyData;
    }

    try {
      const response = await this.client.get('/indicators/lth-supply');
      
      const lthSupply = response.data.lth_supply || 14500000;
      const sthSupply = response.data.sth_supply || 5000000;
      const totalSupply = 19500000; // Approximate current supply
      
      const lthPercentage = (lthSupply / totalSupply) * 100;
      const sthPercentage = (sthSupply / totalSupply) * 100;
      
      // Determine market position
      let netPosition: 'accumulation' | 'distribution' | 'neutral' = 'neutral';
      let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
      let confidence = 50;
      
      if (lthPercentage > 75) {
        netPosition = 'accumulation';
        signal = 'sell'; // High LTH often precedes tops
        confidence = 70;
      } else if (lthPercentage < 55) {
        netPosition = 'distribution';
        signal = 'buy'; // Low LTH suggests bottom
        confidence = 65;
      }
      
      const data: LTHSupplyData = {
        value: lthPercentage,
        lthSupply,
        sthSupply,
        lthPercentage,
        sthPercentage,
        netPosition,
        signal,
        confidence,
        timestamp: new Date()
      };
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      console.warn('Failed to fetch LTH Supply from Bitcoin Magazine Pro, using fallback');
      return {
        value: 65,
        lthSupply: 14000000,
        sthSupply: 5500000,
        lthPercentage: 65,
        sthPercentage: 25,
        netPosition: 'neutral',
        signal: 'neutral',
        confidence: 50,
        timestamp: new Date()
      };
    }
  }

  // Get Puell Multiple
  async getPuellMultiple(): Promise<PuellMultipleData> {
    const cacheKey = 'puell_multiple';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as PuellMultipleData;
    }

    try {
      const response = await this.client.get('/indicators/puell-multiple');
      
      const multiple = response.data.value || response.data.puell_multiple || 1.2;
      const minerRevenue = response.data.miner_revenue || 30000000;
      const ma365 = response.data.ma_365 || 25000000;
      
      // Determine signal based on Puell Multiple
      let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
      let confidence = 50;
      
      if (multiple > 4) {
        signal = 'sell';
        confidence = 85;
      } else if (multiple > 2.5) {
        signal = 'sell';
        confidence = 65;
      } else if (multiple < 0.5) {
        signal = 'buy';
        confidence = 90;
      } else if (multiple < 0.7) {
        signal = 'buy';
        confidence = 70;
      }
      
      const data: PuellMultipleData = {
        value: multiple,
        multiple,
        minerRevenue,
        ma365,
        signal,
        confidence,
        timestamp: new Date()
      };
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      console.warn('Failed to fetch Puell Multiple from Bitcoin Magazine Pro, using fallback');
      return {
        value: 1.2,
        multiple: 1.2,
        minerRevenue: 28000000,
        ma365: 23333333,
        signal: 'neutral',
        confidence: 50,
        timestamp: new Date()
      };
    }
  }

  // Get Miner Position Index and related data
  async getMinerData(): Promise<MinerData> {
    const cacheKey = 'miner_data';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as MinerData;
    }

    try {
      const [hashData, minerMetrics] = await Promise.all([
        this.client.get('/indicators/hash-ribbons'),
        this.client.get('/indicators/miner-metrics')
      ]);
      
      const hashRate = hashData.data.hash_rate || 450000000000000000;
      const difficulty = hashData.data.difficulty || 65000000000000;
      const minerRevenue = minerMetrics.data.revenue || 30000000;
      const minerOutflow = minerMetrics.data.outflow || 500;
      const mpi = minerMetrics.data.mpi || (minerOutflow / 365); // Simplified MPI
      
      // Hash Ribbons analysis
      const hashRibbons = {
        buy: hashData.data.buy_signal || false,
        capitulation: hashData.data.capitulation || false,
        recovery: hashData.data.recovery || false
      };
      
      // Determine signal based on MPI
      let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
      let confidence = 50;
      
      if (mpi > 2) {
        signal = 'sell'; // Miners selling heavily
        confidence = 75;
      } else if (mpi < 0.5) {
        signal = 'buy'; // Miners holding
        confidence = 70;
      }
      
      // Override with Hash Ribbons if available
      if (hashRibbons.buy) {
        signal = 'buy';
        confidence = 85;
      }
      
      const data: MinerData = {
        value: mpi,
        hashRate,
        difficulty,
        minerRevenue,
        minerOutflow,
        mpi,
        hashRibbons,
        signal,
        confidence,
        timestamp: new Date()
      };
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      console.warn('Failed to fetch Miner Data from Bitcoin Magazine Pro, using fallback');
      return {
        value: 1.1,
        hashRate: 400000000000000000,
        difficulty: 60000000000000,
        minerRevenue: 25000000,
        minerOutflow: 400,
        mpi: 1.1,
        signal: 'neutral',
        confidence: 50,
        timestamp: new Date()
      };
    }
  }

  // Get NUPL (Net Unrealized Profit/Loss)
  async getNUPL(): Promise<NUPLData> {
    const cacheKey = 'nupl';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as NUPLData;
    }

    try {
      const response = await this.client.get('/indicators/nupl');
      
      const nupl = response.data.value || response.data.nupl || 0.5;
      
      // Determine market phase
      let marketPhase: NUPLData['marketPhase'] = 'optimism';
      let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
      let confidence = 50;
      
      if (nupl > 0.75) {
        marketPhase = 'euphoria';
        signal = 'sell';
        confidence = 90;
      } else if (nupl > 0.5) {
        marketPhase = 'belief';
        signal = 'sell';
        confidence = 60;
      } else if (nupl > 0.25) {
        marketPhase = 'optimism';
        signal = 'neutral';
      } else if (nupl > 0) {
        marketPhase = 'hope';
        signal = 'buy';
        confidence = 60;
      } else if (nupl > -0.25) {
        marketPhase = 'fear';
        signal = 'buy';
        confidence = 75;
      } else {
        marketPhase = 'capitulation';
        signal = 'buy';
        confidence = 90;
      }
      
      const data: NUPLData = {
        value: nupl,
        nupl,
        marketPhase,
        signal,
        confidence,
        timestamp: new Date()
      };
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      console.warn('Failed to fetch NUPL from Bitcoin Magazine Pro, using fallback');
      return {
        value: 0.45,
        nupl: 0.45,
        marketPhase: 'optimism',
        signal: 'neutral',
        confidence: 50,
        timestamp: new Date()
      };
    }
  }

  // Get RHODL Ratio
  async getRHODL(): Promise<RHODLData> {
    const cacheKey = 'rhodl';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as RHODLData;
    }

    try {
      const response = await this.client.get('/indicators/rhodl-ratio');
      
      const rhodl = response.data.value || response.data.rhodl || 15000;
      
      let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
      let confidence = 50;
      
      if (rhodl > 50000) {
        signal = 'sell';
        confidence = 85;
      } else if (rhodl > 30000) {
        signal = 'sell';
        confidence = 65;
      } else if (rhodl < 1000) {
        signal = 'buy';
        confidence = 90;
      } else if (rhodl < 5000) {
        signal = 'buy';
        confidence = 70;
      }
      
      const data: RHODLData = {
        value: rhodl,
        ratio: rhodl,
        rhodlRatio: rhodl,
        signal,
        confidence,
        timestamp: new Date()
      };
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      console.warn('Failed to fetch RHODL from Bitcoin Magazine Pro, using fallback');
      return {
        value: 12000,
        ratio: 12000,
        rhodlRatio: 12000,
        signal: 'neutral',
        confidence: 50,
        timestamp: new Date()
      };
    }
  }

  // Get Reserve Risk
  async getReserveRisk(): Promise<ReserveRiskData> {
    const cacheKey = 'reserve_risk';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as ReserveRiskData;
    }

    try {
      const response = await this.client.get('/indicators/reserve-risk');
      
      const risk = response.data.value || response.data.reserve_risk || 0.003;
      
      let opportunity: 'high' | 'medium' | 'low' = 'medium';
      let signal: 'buy' | 'neutral' | 'sell' = 'neutral';
      let confidence = 50;
      
      if (risk > 0.02) {
        opportunity = 'low';
        signal = 'sell';
        confidence = 80;
      } else if (risk > 0.01) {
        opportunity = 'low';
        signal = 'sell';
        confidence = 60;
      } else if (risk < 0.0015) {
        opportunity = 'high';
        signal = 'buy';
        confidence = 85;
      } else if (risk < 0.003) {
        opportunity = 'high';
        signal = 'buy';
        confidence = 65;
      }
      
      const data: ReserveRiskData = {
        value: risk,
        risk,
        opportunity,
        signal,
        confidence,
        timestamp: new Date()
      };
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      console.warn('Failed to fetch Reserve Risk from Bitcoin Magazine Pro, using fallback');
      return {
        value: 0.0035,
        risk: 0.0035,
        opportunity: 'medium',
        signal: 'neutral',
        confidence: 50,
        timestamp: new Date()
      };
    }
  }
}