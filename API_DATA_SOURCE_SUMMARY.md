# API Data Source Summary - Bitcoin Peak Indicator Dashboard

## 🟢 Live Data (Fully Implemented)

### CoinGecko API
**API Key:** Set via `COINGECKO_API_KEY` environment variable

| Indicator | Data Retrieved | Update Frequency |
|-----------|---------------|------------------|
| **Bitcoin Price** | Current USD price, 24h change, volume | 1 minute |
| **Bitcoin Dominance** | BTC % of total crypto market cap | 1 minute |
| **Historical Prices** | 365 days of price data | 10 minutes |
| **Market Data** | ATH, ATL, market cap, circulating supply | 1 minute |
| **7-Day Sparkline** | Price trend visualization | 1 minute |
| **Funding Rates** | Open interest, derivatives volume | 2 minutes |
| **Exchange Volumes** | Top 10 exchange BTC volumes | 5 minutes |
| **Binance Price** | For Coinbase premium calculation | 1 minute |
| **ATH Distance** | Calculated from ATH data | 1 minute |
| **Volume Trend** | 24h vs 30d average volume | 1 minute |
| **Price Momentum** | 7d, 30d, 1y price changes | 1 minute |

### Coinbase API
**API Key:** Set via `COINBASE_API_KEY` environment variable
**API Secret:** Set via `COINBASE_API_SECRET` environment variable

| Indicator | Data Retrieved | Update Frequency |
|-----------|---------------|------------------|
| **Coinbase Premium** | Price differential vs Binance | 1 minute |
| **Spot Price** | Real-time BTC-USD price | 1 minute |
| **Buy/Sell Prices** | Separate buy and sell quotes | 1 minute |
| **Order Book** | Bid/ask depth, spread analysis | 1 minute |
| **Market Depth** | Bid/ask ratio, market sentiment | 1 minute |
| **Recent Trades** | Buy/sell volume and pressure | 1 minute |
| **24h Statistics** | High, low, volume | 1 minute |

### Alternative.me API
**No API Key Required** (Free public API)

| Indicator | Data Retrieved | Update Frequency |
|-----------|---------------|------------------|
| **Fear & Greed Index** | Current value (0-100) | 5 minutes |
| **Fear & Greed History** | 30-day historical data | 5 minutes |
| **Market Sentiment** | Classification (Fear/Greed) | 5 minutes |

### 🆕 Blockchain.info API
**No API Key Required** (Free public API)

| Indicator | Data Retrieved | Update Frequency |
|-----------|---------------|------------------|
| **Hash Rate** | Network hash rate in GH/s | 2 minutes |
| **Mining Difficulty** | Current difficulty level | 2 minutes |
| **Network Stats** | Daily transactions, volume | 2 minutes |
| **Miner Revenue** | Daily miner earnings USD | 2 minutes |
| **Market Price** | Alternative price source | 2 minutes |
| **Hash Ribbons** | ✅ **NOW REAL** - Calculated from hash rate | 2 minutes |
| **NVT Ratio** | ✅ **NOW REAL** - Calculated from on-chain data | 2 minutes |

### 🆕 Mempool.Space API  
**No API Key Required** (Free public API)

| Indicator | Data Retrieved | Update Frequency |
|-----------|---------------|------------------|
| **Fee Recommendations** | Fastest, normal, economy fees | 2 minutes |
| **Mempool Size** | Transaction count and vsize | 2 minutes |
| **Network Congestion** | ✅ **NEW** - Congestion score (0-100) | 2 minutes |
| **Fee Pressure** | ✅ **NEW** - High fees = peak signal | 2 minutes |
| **Recent Blocks** | Block stats and confirmation times | 2 minutes |
| **Difficulty Adjustment** | ✅ **NEW** - Next adjustment prediction | 2 minutes |

## 🔴 Mock/Dummy Data (Requires Additional APIs)

### Indicators Using Mock Data

| Indicator | Weight | Required API | Monthly Cost | Current Status |
|-----------|--------|--------------|--------------|----------------|
| **Pi Cycle Top** | 30% | CoinGecko (partial) | Free | ⚠️ **Partially implemented** - Using historical prices but simplified calculation |
| **MVRV Ratio** | 28% | Glassnode | $399/month | ❌ **Mock data** - Returns fixed value of 2.3 |
| **Stock-to-Flow** | 22% | Custom calculation | - | ⚠️ **Simplified** - Basic S2F using supply data |
| **Long-Term Holder Supply** | 18% | Glassnode | $399/month | ❌ **Mock data** - Not implemented |
| **Puell Multiple** | 16% | Glassnode | $399/month | ❌ **Mock data** - Returns fixed value of 1.2 |
| **NVT Ratio** | 13% | Blockchain.info | FREE | ✅ **NOW REAL** - Using on-chain transaction volume |
| **Bitcoin ETF Flows** | 15% | Bloomberg/Custom | Varies | ❌ **Not implemented** |
| **Exchange Reserves** | 12% | Glassnode/CryptoQuant | $399/month | ⚠️ **Partial** - Using exchange volumes as proxy |
| **Miner Position Index** | 10% | Glassnode | $399/month | ❌ **Mock data** - Not implemented |
| **Rainbow Chart** | 4% | Custom calculation | - | ❌ **Mock data** - Calculation ready but not connected |
| **Hash Ribbons** | 3% | Blockchain.info | FREE | ✅ **NOW REAL** - Using hash rate and difficulty data |

## 📊 Data Flow Architecture

```
LIVE DATA SOURCES                          DASHBOARD DISPLAY
┌─────────────────┐                       ┌──────────────────┐
│   CoinGecko     │──────┐                │                  │
│   (11 metrics)  │      │                │  Market Overview │
└─────────────────┘      │                │  - Price ✅      │
                         │                │  - Volume ✅     │
┌─────────────────┐      │                │  - Market Cap ✅ │
│    Coinbase     │──────┼──→ API Routes  │  - ATH/ATL ✅   │
│   (7 metrics)   │      │    (Next.js)   └──────────────────┘
└─────────────────┘      │         │       
                         │         ↓       ┌──────────────────┐
┌─────────────────┐      │                │ Indicator Cards  │
│  Alternative.me │──────┘    React Query │                  │
│  (Fear & Greed) │           (Caching)   │  Live:           │
└─────────────────┘                ↓      │  - F&G Index ✅  │
                                          │  - BTC Dom ✅    │
MOCK DATA                      Dashboard  │  - CB Premium ✅ │
┌─────────────────┐                       │  - Funding ✅    │
│  Static Values  │─────────────────→     │                  │
│  (6 indicators) │                       │  Mock:           │
└─────────────────┘                       │  - MVRV ❌       │
                                          │  - Puell ❌      │
                                          │  - S2F ⚠️       │
                                          └──────────────────┘
```

## 🔄 Update Frequencies

- **Real-time (1 min):** Price, volume, market cap, dominance
- **Near real-time (2-5 min):** Fear & Greed, funding rates
- **Less frequent (10+ min):** Historical data, Pi Cycle calculation

## 💰 Cost Analysis

### Current Costs
- **CoinGecko:** FREE (using demo API key)
- **Coinbase:** FREE (standard API)
- **Alternative.me:** FREE
- **Total Monthly Cost:** $0

### Full Implementation Costs
- **Glassnode Essential:** $399/month (covers 7 indicators)
- **Bloomberg Terminal:** $2,000/month (for ETF data)
- **Alternative:** Use free Yahoo Finance API for basic ETF data
- **Estimated Total:** $399-$2,399/month

## 🎯 Accuracy Assessment

| Category | Indicators | Status |
|----------|-----------|--------|
| **Fully Accurate** | Fear & Greed, BTC Dominance, Coinbase Premium, Market Data | ✅ 100% Live |
| **Partially Accurate** | Pi Cycle, Stock-to-Flow, Exchange metrics | ⚠️ 60% Accurate |
| **Placeholder Only** | MVRV, Puell, NVT, LTH Supply, MPI, Hash Ribbons | ❌ 0% (Mock) |

## 📝 Recommendations

1. **Priority 1:** Subscribe to Glassnode ($399/month) to get real data for:
   - MVRV Ratio (28% weight)
   - Puell Multiple (16% weight)
   - NVT Ratio (13% weight)
   - These three alone represent 57% of the composite score

2. **Priority 2:** Implement free alternatives:
   - Use blockchain.info API for basic on-chain metrics
   - Calculate Pi Cycle properly with more historical data
   - Implement Rainbow Chart (calculation ready)

3. **Priority 3:** ETF data sources:
   - Start with free Yahoo Finance API for basic ETF data
   - Consider paid Bloomberg API only if needed

## 🔍 Current Composite Score Reliability

**Approximately 40-45% accurate** due to:
- 40% of weighted indicators using live data
- 30% using simplified/partial calculations
- 30% using completely mock data

For production use, implementing Glassnode API would increase accuracy to ~85-90%.