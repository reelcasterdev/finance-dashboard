import { NextResponse } from 'next/server';
import { BlockchainInfoClient } from '@/lib/api/blockchain-info';
import { MempoolSpaceClient } from '@/lib/api/mempool-space';

export async function GET() {
  try {
    const blockchain = new BlockchainInfoClient();
    const mempool = new MempoolSpaceClient();

    // Fetch data from both sources with error handling
    const [
      blockchainStats,
      mempoolStats,
      recommendedFees,
      difficultyAdjustment,
      recentBlocks
    ] = await Promise.allSettled([
      blockchain.getStats(),
      mempool.getMempoolStats(),
      mempool.getRecommendedFees(),
      mempool.getDifficultyAdjustment(),
      mempool.getRecentBlocks()
    ]);

    // Extract values with defaults
    const stats = blockchainStats.status === 'fulfilled' ? blockchainStats.value : {
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

    const mempoolData = mempoolStats.status === 'fulfilled' ? mempoolStats.value : {
      count: 0,
      vsize: 0,
      total_fee: 0,
      feeHistogram: [],
    };

    const fees = recommendedFees.status === 'fulfilled' ? recommendedFees.value : {
      fastestFee: 20,
      halfHourFee: 15,
      hourFee: 10,
      economyFee: 5,
      minimumFee: 1,
    };

    const diffAdjustment = difficultyAdjustment.status === 'fulfilled' ? difficultyAdjustment.value : {
      progressPercent: 50,
      difficultyChange: 0,
      estimatedRetargetDate: Date.now(),
      remainingBlocks: 1000,
      remainingTime: 0,
      previousRetarget: 0,
      nextRetargetHeight: 0,
    };

    const blocks = recentBlocks.status === 'fulfilled' ? recentBlocks.value : [];

    // Calculate indicators
    const networkHealth = blockchain.calculateNetworkHealth({
      ...stats,
      unconfirmedTxCount: mempoolData.count,
      dailyTransactions: stats.nTx,
    });

    const feePressure = mempool.calculateFeePressure(fees);
    const congestion = mempool.calculateCongestion(mempoolData, fees);

    // Hash Ribbons indicator
    const hashRibbons = {
      hashRate: stats.hashRate,
      difficulty: stats.difficulty,
      signal: networkHealth.score > 70 ? 'buy' : networkHealth.score < 40 ? 'sell' : 'neutral',
      confidence: Math.abs(networkHealth.score - 50) + 30,
      description: `Network health: ${networkHealth.score}/100`,
    };

    // Network Activity indicator (NVT proxy)
    const networkActivity = {
      dailyTransactions: stats.nTx,
      transactionVolume: stats.estimatedTransactionVolume,
      nvtRatio: stats.estimatedTransactionVolume > 0 ? stats.marketPriceUsd * 21000000 / stats.estimatedTransactionVolume : 100,
      signal: 'neutral' as 'buy' | 'sell' | 'neutral',
      confidence: 60,
    };

    // Set NVT signal based on ratio
    if (networkActivity.nvtRatio > 150) {
      networkActivity.signal = 'sell';
      networkActivity.confidence = 70;
    } else if (networkActivity.nvtRatio < 50) {
      networkActivity.signal = 'buy';
      networkActivity.confidence = 70;
    }

    return NextResponse.json({
      networkHealth: {
        score: networkHealth.score,
        signal: networkHealth.signal,
        hashRate: stats.hashRate,
        difficulty: stats.difficulty,
        blockTime: stats.minutesBetweenBlocks,
      },
      mempool: {
        size: mempoolData.count,
        vsize: mempoolData.vsize,
        totalFee: mempoolData.total_fee,
        congestion: congestion,
      },
      fees: {
        recommended: fees,
        pressure: feePressure,
      },
      difficulty: diffAdjustment,
      hashRibbons,
      networkActivity,
      recentBlocks: blocks.slice(0, 5),
      minersRevenue: stats.minersRevenue,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in network-health API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network health data' },
      { status: 500 }
    );
  }
}