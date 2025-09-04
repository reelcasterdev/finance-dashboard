import { NextResponse } from 'next/server';
import { LightningNetworkClient } from '@/lib/api/lightning-network';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = new LightningNetworkClient();
    
    // Get comprehensive Lightning data
    const lightningData = await client.getLightningData();
    const feesTrend = await client.getRoutingFeesTrend();
    
    return NextResponse.json({
      network: {
        nodes: lightningData.stats.nodeCount,
        channels: lightningData.stats.channelCount,
        capacityBTC: lightningData.stats.totalCapacityBTC,
        avgCapacityBTC: lightningData.stats.avgCapacityBTC,
        torNodes: lightningData.stats.torNodes,
        clearnetNodes: lightningData.stats.clearnetNodes
      },
      growth: {
        nodesAdded30d: lightningData.growth.nodesAdded30d,
        channelsAdded30d: lightningData.growth.channelsAdded30d,
        capacityAdded30d: lightningData.growth.capacityAdded30d,
        growthRate: lightningData.growth.growthRate
      },
      fees: feesTrend,
      topNodes: lightningData.topNodes.slice(0, 5).map(node => ({
        alias: node.alias,
        capacity: node.capacity,
        channels: node.channelCount
      })),
      adoptionScore: lightningData.adoptionScore,
      signal: lightningData.signal,
      confidence: lightningData.confidence,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching Lightning Network data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Lightning Network data' },
      { status: 500 }
    );
  }
}