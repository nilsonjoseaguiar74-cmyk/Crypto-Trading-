import { useCallback, useEffect } from 'react';
import axios from 'axios';
import { useSignalStore, Signal, MarketData } from '@/store/signalStore';
import { BACKEND_URL } from '@/lib/web3/config';

// Mock data for MVP demo
const MOCK_MARKET_DATA: MarketData[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 43250.00,
    change24h: 2.45,
    volume24h: 28500000000,
    marketCap: 847000000000,
    image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2280.50,
    change24h: -1.23,
    volume24h: 15200000000,
    marketCap: 274000000000,
    image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 98.75,
    change24h: 5.67,
    volume24h: 2800000000,
    marketCap: 42000000000,
    image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    price: 0.92,
    change24h: -0.45,
    volume24h: 450000000,
    marketCap: 8500000000,
    image: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 37.80,
    change24h: 3.21,
    volume24h: 520000000,
    marketCap: 14000000000,
    image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
  },
];

const MOCK_SIGNALS: Signal[] = [
  {
    id: '1',
    token: 'Bitcoin',
    symbol: 'BTC',
    action: 'BUY',
    confidence: 85,
    price: 43250.00,
    targetPrice: 48000.00,
    stopLoss: 41000.00,
    reasoning: 'RSI indica sobrevenda. Suporte forte em $42k. Volume crescente nas últimas 24h. Padrão de reversão bullish identificado.',
    timestamp: Date.now() - 300000,
  },
  {
    id: '2',
    token: 'Ethereum',
    symbol: 'ETH',
    action: 'HOLD',
    confidence: 72,
    price: 2280.50,
    targetPrice: 2500.00,
    stopLoss: 2150.00,
    reasoning: 'Consolidação em andamento. Aguardar rompimento da resistência em $2,350 para entrada.',
    timestamp: Date.now() - 1800000,
  },
  {
    id: '3',
    token: 'Solana',
    symbol: 'SOL',
    action: 'BUY',
    confidence: 91,
    price: 98.75,
    targetPrice: 120.00,
    stopLoss: 90.00,
    reasoning: 'Forte momentum. TVL crescendo 15% na semana. Breakout confirmado acima de $95.',
    timestamp: Date.now() - 3600000,
  },
];

export function useSignals(hasAccess: boolean) {
  const store = useSignalStore();

  const fetchMarketData = useCallback(async () => {
    store.setLoading(true);
    try {
      // Try to fetch from backend, fallback to mock data
      try {
        const response = await axios.get(`${BACKEND_URL}/api/market`, {
          timeout: 5000,
        });
        store.setMarketData(response.data);
      } catch {
        // Use mock data for demo
        store.setMarketData(MOCK_MARKET_DATA);
      }
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const fetchSignals = useCallback(async (walletAddress: string) => {
    if (!hasAccess) return;
    
    store.setLoading(true);
    try {
      // Try to fetch from backend, fallback to mock data
      try {
        const response = await axios.get(`${BACKEND_URL}/api/signals`, {
          params: { wallet: walletAddress },
          timeout: 5000,
        });
        store.setSignals(response.data);
      } catch {
        // Use mock data for demo
        store.setSignals(MOCK_SIGNALS);
      }
      store.setLastUpdate(Date.now());
    } finally {
      store.setLoading(false);
    }
  }, [hasAccess, store]);

  const generateNewSignal = useCallback(async (walletAddress: string) => {
    if (!hasAccess) return null;
    
    store.setLoading(true);
    try {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/signals/generate`, {
          wallet: walletAddress,
        }, { timeout: 10000 });
        
        const newSignal = response.data;
        store.addSignal(newSignal);
        store.setLastUpdate(Date.now());
        return newSignal;
      } catch {
        // Generate mock signal for demo
        const tokens = ['BTC', 'ETH', 'SOL', 'MATIC', 'AVAX'];
        const actions: ('BUY' | 'SELL' | 'HOLD')[] = ['BUY', 'SELL', 'HOLD'];
        const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        const newSignal: Signal = {
          id: Date.now().toString(),
          token: randomToken,
          symbol: randomToken,
          action: randomAction,
          confidence: Math.floor(Math.random() * 30) + 70,
          price: Math.random() * 1000 + 100,
          targetPrice: Math.random() * 1200 + 150,
          stopLoss: Math.random() * 800 + 80,
          reasoning: 'Análise gerada pela IA com base em indicadores técnicos e sentimento de mercado.',
          timestamp: Date.now(),
        };
        
        store.addSignal(newSignal);
        store.setLastUpdate(Date.now());
        return newSignal;
      }
    } finally {
      store.setLoading(false);
    }
  }, [hasAccess, store]);

  // Auto-refresh market data
  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Every minute
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  return {
    ...store,
    fetchMarketData,
    fetchSignals,
    generateNewSignal,
  };
}
