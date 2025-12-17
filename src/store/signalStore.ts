import { create } from 'zustand';

export interface Signal {
  id: string;
  token: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  price: number;
  targetPrice: number;
  stopLoss: number;
  reasoning: string;
  timestamp: number;
  isNew?: boolean;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  image: string;
}

interface SignalState {
  signals: Signal[];
  marketData: MarketData[];
  isLoading: boolean;
  lastUpdate: number | null;
  
  // Actions
  setSignals: (signals: Signal[]) => void;
  addSignal: (signal: Signal) => void;
  setMarketData: (data: MarketData[]) => void;
  setLoading: (loading: boolean) => void;
  setLastUpdate: (timestamp: number) => void;
}

export const useSignalStore = create<SignalState>((set) => ({
  signals: [],
  marketData: [],
  isLoading: false,
  lastUpdate: null,

  setSignals: (signals) => set({ signals }),
  addSignal: (signal) => set((state) => ({
    signals: [{ ...signal, isNew: true }, ...state.signals.slice(0, 9)],
  })),
  setMarketData: (marketData) => set({ marketData }),
  setLoading: (isLoading) => set({ isLoading }),
  setLastUpdate: (lastUpdate) => set({ lastUpdate }),
}));
