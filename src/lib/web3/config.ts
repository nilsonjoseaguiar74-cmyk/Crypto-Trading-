// Contract addresses and chain config
export const SEPOLIA_CHAIN_ID = 11155111;

export const CONTRACT_ADDRESSES = {
  strategyVault: "0x0000000000000000000000000000000000000000", // Will be deployed
} as const;

export const CHAIN_CONFIG = {
  [SEPOLIA_CHAIN_ID]: {
    name: "Sepolia Testnet",
    rpcUrl: "https://rpc.sepolia.org",
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Sepolia ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
} as const;

// Strategy Vault ABI - basic access control
export const STRATEGY_VAULT_ABI = [
  {
    inputs: [{ name: "user", type: "address" }],
    name: "hasAccess",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getSubscriptionExpiry",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "subscribe",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
