import { create } from 'zustand';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  hasAccess: boolean;
  accessExpiry: number | null;
  error: string | null;
  
  // Actions
  setAddress: (address: string | null) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setChainId: (chainId: number | null) => void;
  setAccess: (hasAccess: boolean, expiry?: number | null) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  isConnecting: false,
  chainId: null,
  hasAccess: false,
  accessExpiry: null,
  error: null,

  setAddress: (address) => set({ address }),
  setConnected: (isConnected) => set({ isConnected }),
  setConnecting: (isConnecting) => set({ isConnecting }),
  setChainId: (chainId) => set({ chainId }),
  setAccess: (hasAccess, expiry = null) => set({ hasAccess, accessExpiry: expiry }),
  setError: (error) => set({ error }),
  disconnect: () => set({
    address: null,
    isConnected: false,
    chainId: null,
    hasAccess: false,
    accessExpiry: null,
    error: null,
  }),
}));
