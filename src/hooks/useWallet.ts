import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletStore } from '@/store/walletStore';
import { SEPOLIA_CHAIN_ID, CHAIN_CONFIG } from '@/lib/web3/config';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const store = useWalletStore();
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const checkMetaMask = useCallback(() => {
    return typeof window !== 'undefined' && window.ethereum;
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return false;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          const config = CHAIN_CONFIG[SEPOLIA_CHAIN_ID];
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: config.name,
              rpcUrls: [config.rpcUrl],
              blockExplorerUrls: [config.blockExplorer],
              nativeCurrency: config.nativeCurrency,
            }],
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!checkMetaMask()) {
      store.setError('MetaMask não encontrada. Por favor, instale a extensão.');
      return false;
    }

    store.setConnecting(true);
    store.setError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        store.setError('Nenhuma conta encontrada.');
        store.setConnecting(false);
        return false;
      }

      const network = await browserProvider.getNetwork();
      const chainId = Number(network.chainId);

      if (chainId !== SEPOLIA_CHAIN_ID) {
        const switched = await switchToSepolia();
        if (!switched) {
          store.setError('Por favor, conecte à rede Sepolia.');
          store.setConnecting(false);
          return false;
        }
      }

      const signerInstance = await browserProvider.getSigner();
      
      setProvider(browserProvider);
      setSigner(signerInstance);
      store.setAddress(accounts[0]);
      store.setChainId(SEPOLIA_CHAIN_ID);
      store.setConnected(true);
      store.setConnecting(false);
      
      // Simulating access check (in production, this would check the smart contract)
      // For MVP demo, we grant access to connected wallets
      store.setAccess(true, Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      return true;
    } catch (error: any) {
      store.setError(error.message || 'Falha ao conectar carteira.');
      store.setConnecting(false);
      return false;
    }
  }, [checkMetaMask, switchToSepolia, store]);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    store.disconnect();
  }, [store]);

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        store.setAddress(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect, store]);

  return {
    ...store,
    provider,
    signer,
    connect,
    disconnect,
    checkMetaMask,
  };
}
