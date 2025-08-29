# Bitcoin Peak Indicator Dashboard - Implementation Plan

## Project Overview
A comprehensive dashboard that integrates multiple Bitcoin cycle indicators to predict market peaks using weighted scoring and modern visualization.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15.5 with TypeScript
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Charts**: Recharts or TradingView Lightweight Charts
- **State Management**: Zustand or React Context
- **Data Fetching**: TanStack Query (React Query)
- **API Layer**: Next.js API Routes with caching
- **Real-time Updates**: WebSockets or Server-Sent Events
- **Design System**: Discord-inspired color palette (Dark theme primary)

## API Requirements

### Primary Data Sources

#### 1. Glassnode API (Paid - $399/month for Essential)
- **Endpoints Required**:
  - `/v1/metrics/indicators/mvrv` - MVRV Ratio
  - `/v1/metrics/supply/lth_supply` - Long-Term Holder Supply
  - `/v1/metrics/indicators/puell_multiple` - Puell Multiple
  - `/v1/metrics/indicators/nvt` - NVT Ratio
  - `/v1/metrics/supply/exchange_balance` - Exchange Reserves
  - `/v1/metrics/indicators/mpi` - Miner Position Index
  - `/v1/metrics/mining/hash_rate_ma` - Hash Ribbons
- **Authentication**: API Key in headers
- **Rate Limits**: 10 req/s (Essential plan)

#### 2. Alternative.me API (Free)
- **Endpoint**: `https://api.alternative.me/fng/`
- **Data**: Fear & Greed Index
- **Rate Limits**: 100 req/hour

#### 3. CoinGecko API (Free tier available)
- **Endpoints**:
  - `/api/v3/global` - Bitcoin Dominance
  - `/api/v3/derivatives` - Funding Rates
- **Rate Limits**: 10-30 calls/minute (free tier)

#### 4. Custom Calculations Required
- **Pi Cycle Top**: Calculate 111DMA and 350DMA×2
- **Stock-to-Flow**: Implement S2F model
- **Coinbase Premium**: Compare Coinbase vs Binance prices
- **Rainbow Chart**: Logarithmic regression bands
- **Bitcoin ETF Flows**: Aggregate from multiple sources

### API Integration Strategy
1. Use Next.js API routes as proxy to handle authentication
2. Implement Redis caching for expensive API calls
3. Create fallback data sources for redundancy
4. Use webhook endpoints for real-time updates where available

## Project Structure

```
finance-indicator/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── indicators/
│   │   │   │   ├── [indicator]/route.ts
│   │   │   │   └── composite/route.ts
│   │   │   └── webhooks/
│   │   │       └── route.ts
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/           # shadcn components
│   │   ├── indicators/
│   │   │   ├── pi-cycle-indicator.tsx
│   │   │   ├── mvrv-indicator.tsx
│   │   │   ├── stock-to-flow-indicator.tsx
│   │   │   └── ...
│   │   ├── dashboard/
│   │   │   ├── composite-score.tsx
│   │   │   ├── indicator-grid.tsx
│   │   │   └── peak-probability.tsx
│   │   └── charts/
│   │       ├── line-chart.tsx
│   │       ├── gauge-chart.tsx
│   │       └── heat-map.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── glassnode.ts
│   │   │   ├── coingecko.ts
│   │   │   ├── alternative.ts
│   │   │   └── cache.ts
│   │   ├── indicators/
│   │   │   ├── calculations.ts
│   │   │   ├── weights.ts
│   │   │   └── composite.ts
│   │   ├── hooks/
│   │   │   ├── use-indicator.ts
│   │   │   ├── use-realtime.ts
│   │   │   └── use-composite.ts
│   │   └── utils/
│   │       ├── formatters.ts
│   │       └── constants.ts
│   └── types/
│       ├── indicators.ts
│       └── api.ts
├── .env.local
└── redis.conf
```

## Implementation Steps

### Phase 1: Foundation (Week 1)
1. **Set up shadcn/ui**
   - Install and configure shadcn/ui
   - Set up Tailwind CSS configuration
   - Import base components (Card, Button, Badge, Alert, etc.)

2. **Create Type Definitions**
   - Define indicator interfaces
   - API response types
   - Dashboard state types

3. **Build API Integration Layer**
   - Create API client classes
   - Implement authentication
   - Set up error handling

### Phase 2: Core Indicators (Week 2)
1. **Implement Top 5 Indicators**
   - Pi Cycle Top (30% weight)
   - MVRV Ratio (28% weight)
   - Stock-to-Flow (22% weight)
   - Long-Term Holder Supply (18% weight)
   - Puell Multiple (16% weight)

2. **Create Indicator Components**
   - Individual indicator cards
   - Historical chart views
   - Current value displays
   - Threshold alerts

### Phase 3: Dashboard Assembly (Week 3)
1. **Build Dashboard Layout**
   - Responsive grid system
   - Navigation and filtering
   - Time range selectors

2. **Implement Composite Score**
   - Weighted calculation engine
   - Peak probability algorithm
   - Visual score representation

3. **Add Remaining Indicators**
   - NVT Ratio, ETF Flows, Exchange Reserves
   - Miner Position Index, Fear & Greed
   - Bitcoin Dominance, Funding Rates
   - Coinbase Premium, Rainbow Chart, Hash Ribbons

### Phase 4: Advanced Features (Week 4)
1. **Real-time Updates**
   - WebSocket connections
   - Live price feeds
   - Auto-refresh intervals

2. **Data Caching & Optimization**
   - Redis integration
   - Client-side caching
   - Progressive loading

3. **Alerts & Notifications**
   - Threshold alerts
   - Email/SMS integration
   - Custom alert rules

## Design System & Color Palette

### Discord-Inspired Color Scheme
Based on the client's requirements, we'll use Discord's modern color palette for a familiar, professional look.

#### Primary Colors
| Color Name | Hex Code | CSS Variable | Usage |
|------------|----------|--------------|--------|
| Blurple | #5865F2 | --color-primary | Primary actions, key indicators |
| Green | #57F287 | --color-success | Positive signals, buy zones |
| Yellow | #FEE75C | --color-warning | Caution zones, neutral signals |
| Red | #ED4245 | --color-danger | Sell signals, peak warnings |
| Fuchsia | #EB459E | --color-accent | Special highlights, ATH markers |

#### Dark Theme (Primary)
| Element | Hex Code | CSS Variable | Usage |
|---------|----------|--------------|--------|
| Background Primary | #36393F | --bg-primary | Main dashboard background |
| Background Secondary | #2F3136 | --bg-secondary | Card backgrounds |
| Background Tertiary | #202225 | --bg-tertiary | Sidebar, headers |
| Text Primary | #FFFFFF | --text-primary | Main text, values |
| Text Secondary | #B9BBBE | --text-secondary | Labels, descriptions |
| Border | #40444B | --border | Card borders, dividers |

#### Indicator Signal Colors
| Signal | Color | Hex | Usage |
|--------|-------|-----|--------|
| Strong Buy | Green | #57F287 | Bottom signals, accumulation zones |
| Buy | Light Green | #7FE5A3 | Moderate buy signals |
| Neutral | Yellow | #FEE75C | Sideways/uncertain markets |
| Sell | Orange | #FFA500 | Early warning signals |
| Strong Sell | Red | #ED4245 | Peak/distribution signals |

### Dashboard Layout (Based on Sketch)

#### Top Section - Composite Score
- **Circular gauge** showing overall market cycle position (0-100%)
- **Peak probability percentage** in large text
- **Signal status** badge (Buy/Neutral/Sell)
- **Last update timestamp**

#### Grid Layout - Individual Indicators
**Row 1: High Weight Indicators (30-20%)**
- Pi Cycle Top Card
- MVRV Ratio Card
- Stock-to-Flow Card

**Row 2: Medium Weight Indicators (18-10%)**
- Long-Term Holder Supply
- Puell Multiple
- NVT Ratio
- Bitcoin ETF Flows

**Row 3: Supporting Indicators (12-5%)**
- Exchange Reserves
- Miner Position Index
- Fear & Greed Index
- Bitcoin Dominance

**Row 4: Minor Indicators (6-3%)**
- Funding Rates
- Coinbase Premium
- Rainbow Chart
- Hash Ribbons

#### Card Component Structure
Each indicator card includes:
- **Header**: Indicator name + weight badge
- **Current Value**: Large prominent display
- **Signal Badge**: Buy/Neutral/Sell with color coding
- **Mini Chart**: 7-day sparkline
- **Threshold Bar**: Visual representation of current position
- **Last Update**: Timestamp

## Coding Guidelines

### TypeScript Standards
```typescript
// Use strict typing
interface IndicatorData {
  value: number;
  timestamp: Date;
  signal: 'buy' | 'neutral' | 'sell';
  confidence: number;
}

// Prefer const assertions
const WEIGHTS = {
  PI_CYCLE: 0.30,
  MVRV: 0.28,
  S2F: 0.22,
} as const;

// Use enums for constants
enum IndicatorStatus {
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}
```

### Component Structure
```typescript
// Use functional components with TypeScript
interface IndicatorCardProps {
  indicator: IndicatorData;
  weight: number;
  onRefresh?: () => void;
}

export function IndicatorCard({ 
  indicator, 
  weight, 
  onRefresh 
}: IndicatorCardProps) {
  // Component logic
}
```

### API Integration Pattern
```typescript
// Use async/await with proper error handling
export async function fetchIndicator(
  type: IndicatorType
): Promise<IndicatorData> {
  try {
    const response = await fetch(`/api/indicators/${type}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    throw error;
  }
}
```

### shadcn/ui Usage with Discord Theme
```typescript
// Import shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Use with Discord-themed styling
<Card className="bg-discord-secondary border-discord-border hover:shadow-discord transition-all">
  <CardHeader>
    <CardTitle className="text-discord-white">Indicator Name</CardTitle>
    <Badge className="bg-discord-blurple text-white">30% Weight</Badge>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-discord-green">7.5</div>
    <Badge variant="success" className="bg-discord-green/20 text-discord-green">
      Buy Signal
    </Badge>
  </CardContent>
</Card>
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        discord: {
          blurple: '#5865F2',
          green: '#57F287',
          yellow: '#FEE75C',
          red: '#ED4245',
          fuchsia: '#EB459E',
          'bg-primary': '#36393F',
          'bg-secondary': '#2F3136',
          'bg-tertiary': '#202225',
          'text-primary': '#FFFFFF',
          'text-secondary': '#B9BBBE',
          'border': '#40444B',
          'greyple': '#99AAB5',
          'not-quite-black': '#23272A',
          'dark-not-black': '#2C2F33',
        },
        indicator: {
          'strong-buy': '#57F287',
          'buy': '#7FE5A3',
          'neutral': '#FEE75C',
          'sell': '#FFA500',
          'strong-sell': '#ED4245',
        }
      },
      boxShadow: {
        'discord': '0 1px 3px rgba(0,0,0,0.4)',
        'discord-lg': '0 8px 16px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px var(--color-primary)' },
          '100%': { boxShadow: '0 0 20px var(--color-primary)' },
        }
      }
    },
  },
}
```

### State Management
```typescript
// Use Zustand for global state
import { create } from 'zustand'

interface DashboardStore {
  indicators: Map<string, IndicatorData>;
  compositeScore: number;
  updateIndicator: (id: string, data: IndicatorData) => void;
  calculateComposite: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  indicators: new Map(),
  compositeScore: 0,
  updateIndicator: (id, data) => {
    set((state) => ({
      indicators: new Map(state.indicators).set(id, data)
    }));
    get().calculateComposite();
  },
  calculateComposite: () => {
    // Weighted calculation logic
  }
}));
```

### Error Handling
```typescript
// Implement proper error boundaries
export function ErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback: ComponentType<{ error: Error }> 
}) {
  // Error boundary implementation
}

// Use try-catch with specific error types
try {
  const data = await fetchIndicator(type);
  processData(data);
} catch (error) {
  if (error instanceof ApiError) {
    handleApiError(error);
  } else if (error instanceof ValidationError) {
    handleValidationError(error);
  } else {
    handleGenericError(error);
  }
}
```

## Performance Optimizations

1. **Code Splitting**
   - Lazy load indicator components
   - Dynamic imports for charts
   - Route-based splitting

2. **Data Optimization**
   - Implement pagination
   - Use virtual scrolling for lists
   - Compress API responses

3. **Caching Strategy**
   - Cache static data for 1 hour
   - Cache dynamic data for 5 minutes
   - Use stale-while-revalidate pattern

4. **Bundle Optimization**
   - Tree shake unused code
   - Optimize images and assets
   - Use CDN for static resources

## Security Considerations

1. **API Key Management**
   - Store keys in environment variables
   - Never expose keys to client
   - Rotate keys regularly

2. **Rate Limiting**
   - Implement client-side rate limiting
   - Add server-side rate limiting
   - Use queue for API requests

3. **Data Validation**
   - Validate all API responses
   - Sanitize user inputs
   - Use TypeScript for type safety

## Testing Strategy

1. **Unit Tests**
   - Test calculation functions
   - Test API clients
   - Test utility functions

2. **Integration Tests**
   - Test API endpoints
   - Test data flow
   - Test state management

3. **E2E Tests**
   - Test user workflows
   - Test real-time updates
   - Test error scenarios

## Deployment

1. **Environment Setup**
   - Production API keys
   - Redis configuration
   - CDN setup

2. **CI/CD Pipeline**
   - Automated testing
   - Build optimization
   - Deployment automation

3. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - API usage tracking

## Next Steps

1. Install required dependencies
2. Set up shadcn/ui components
3. Create API integration layer
4. Build first indicator component
5. Implement composite scoring
6. Deploy MVP version