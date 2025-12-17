import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

export function WalletConnection() {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [signal, setSignal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const address = accounts[0];
        setAccount(address);
        
        const balance = await provider.getBalance(address);
        setBalance(ethers.formatEther(balance));
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const generateSignal = async () => {
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.get(`${backendUrl}/api/signal/generate`);
      setSignal(response.data);
    } catch (error) {
      console.error("Error generating signal:", error);
      alert("Failed to generate signal. Is the Python agent running?");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 border rounded-lg bg-gray-900 border-gray-700">
      <h2 className="text-xl font-bold mb-4">🔗 Wallet Connection</h2>
      
      {!account ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Connect MetaMask
        </button>
      ) : (
        <div>
          <p className="mb-2">👛 Wallet: {account.slice(0, 6)}...{account.slice(-4)}</p>
          <p className="mb-4">💰 Balance: {parseFloat(balance).toFixed(4)} ETH</p>
          
          <button
            onClick={generateSignal}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Trading Signal'}
          </button>
          
          {signal && (
            <div className="mt-4 p-4 bg-gray-800 rounded">
              <h3 className="font-bold text-lg">📈 Trading Signal</h3>
              <p>Action: <span className="font-bold">{signal.signal}</span></p>
              <p>Token: {signal.token} (${signal.price?.toFixed(2) || 'N/A'})</p>
              <p>Confidence: {(signal.confidence * 100).toFixed(1)}%</p>
              <p className="text-sm text-gray-400">{signal.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
