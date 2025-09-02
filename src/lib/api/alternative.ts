import axios from 'axios';

const ALTERNATIVE_BASE_URL = 'https://api.alternative.me';

export class AlternativeClient {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: ALTERNATIVE_BASE_URL,
    });
  }

  async getFearAndGreedIndex() {
    try {
      const response = await this.client.get('/fng/', {
        params: {
          limit: 30, // Get last 30 days
        },
      });
      
      const currentData = response.data.data[0];
      const historicalData = response.data.data;
      
      return {
        current: {
          value: parseInt(currentData.value),
          classification: currentData.value_classification,
          timestamp: new Date(parseInt(currentData.timestamp) * 1000),
        },
        history: historicalData.map((item: { value: string; value_classification: string; timestamp: string }) => ({
          value: parseInt(item.value),
          classification: item.value_classification,
          timestamp: new Date(parseInt(item.timestamp) * 1000),
        })),
      };
    } catch (error) {
      console.error('Error fetching Fear & Greed Index:', error);
      throw error;
    }
  }

  getSignalFromFearGreed(value: number): 'buy' | 'neutral' | 'sell' {
    if (value <= 20) return 'buy'; // Extreme Fear
    if (value <= 40) return 'buy'; // Fear
    if (value <= 60) return 'neutral'; // Neutral
    if (value <= 80) return 'sell'; // Greed
    return 'sell'; // Extreme Greed
  }
}