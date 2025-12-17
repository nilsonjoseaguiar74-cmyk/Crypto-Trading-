from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from web3 import Web3
from web3.middleware import geth_poa_middleware
import os
import json
import requests
from datetime import datetime
from dotenv import load_dotenv
import logging

# Carregar variáveis de ambiente
load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Wallet-Gated AI Agent API",
    description="Backend para Wallet-Gated AI Trading Platform",
    version="2.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurações
SEPOLIA_RPC = os.getenv("SEPOLIA_RPC_URL", "https://rpc.sepolia.org")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")
COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price"

# Inicializar Web3
w3 = Web3(Web3.HTTPProvider(SEPOLIA_RPC))

# Adicionar middleware para redes POA (como Sepolia)
if SEPOLIA_RPC:
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)

def get_eth_price():
    """Obtém preço do ETH via CoinGecko com fallback"""
    try:
        response = requests.get(
            f"{COINGECKO_API}?ids=ethereum&vs_currencies=usd",
            timeout=5
        )
        response.raise_for_status()
        data = response.json()
        return float(data["ethereum"]["usd"])
    except Exception as e:
        logger.warning(f"Erro ao obter preço do ETH: {e}")
        return 2500.0  # Valor fallback para desenvolvimento

@app.get("/")
async def root():
    """Endpoint raiz com informações do sistema"""
    web3_connected = w3.is_connected()
    latest_block = w3.eth.block_number if web3_connected else None
    
    return {
        "service": "Wallet-Gated AI Agent",
        "status": "operational",
        "version": "2.0.0",
        "web3": {
            "connected": web3_connected,
            "network": "sepolia",
            "latest_block": latest_block,
            "rpc_url": SEPOLIA_RPC[:30] + "..." if SEPOLIA_RPC else None
        },
        "endpoints": {
            "health": "/health",
            "eth_price": "/api/eth-price",
            "generate_signal": "/api/signal/generate",
            "docs": "/docs",
            "redoc": "/redoc"
        },
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    web3_status = "connected" if w3.is_connected() else "disconnected"
    
    return {
        "status": "healthy",
        "web3": web3_status,
        "timestamp": datetime.now().isoformat(),
        "service": "wallet-gated-ai-agent"
    }

@app.get("/api/eth-price")
async def eth_price():
    """Obtém preço atual do ETH"""
    price = get_eth_price()
    
    return {
        "token": "ETH",
        "symbol": "ETH",
        "price_usd": price,
        "price_formatted": f"${price:,.2f}",
        "source": "coingecko",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/signal/generate")
async def generate_signal():
    """Gera sinal de trading baseado em análise de mercado"""
    
    # Obter dados de mercado
    eth_price = get_eth_price()
    
    # Lógica de análise (exemplo simplificado)
    # Em produção, aqui viria seu modelo de IA/ML
    if eth_price > 2800:
        signal = "SELL"
        confidence = 0.75
        reason = "Preço acima da resistência de $2,800"
    elif eth_price < 2200:
        signal = "BUY"
        confidence = 0.80
        reason = "Preço abaixo do suporte de $2,200"
    else:
        signal = "HOLD"
        confidence = 0.65
        reason = "Preço em zona de consolidação"
    
    # Simular análise técnica
    rsi = 45 if signal == "BUY" else 65 if signal == "SELL" else 55
    volume_trend = "alta" if signal == "BUY" else "baixa" if signal == "SELL" else "estável"
    
    return {
        "signal": signal,
        "token": "ETH",
        "price": eth_price,
        "confidence": confidence,
        "rsi": rsi,
        "volume_trend": volume_trend,
        "recommendation": {
            "action": signal,
            "confidence_score": confidence,
            "reason": reason,
            "entry_point": eth_price * 0.98 if signal == "BUY" else eth_price * 1.02,
            "stop_loss": eth_price * 0.95 if signal == "BUY" else eth_price * 1.05,
            "take_profit": eth_price * 1.1 if signal == "BUY" else eth_price * 0.9
        },
        "market_data": {
            "price_usd": eth_price,
            "change_24h": 2.5,  # Exemplo
            "volume_24h": 15000000000,  # Exemplo
            "market_cap": 300000000000  # Exemplo
        },
        "timestamp": datetime.now().isoformat(),
        "message": f"ETH @ ${eth_price:,.2f} | Signal: {signal} | Confidence: {confidence*100:.1f}%"
    }

@app.get("/api/wallet/{address}/balance")
async def wallet_balance(address: str):
    """Obtém saldo e informações de uma wallet"""
    
    if not w3.is_connected():
        raise HTTPException(
            status_code=503,
            detail="Serviço blockchain indisponível"
        )
    
    try:
        # Validar endereço
        if not Web3.is_address(address):
            raise HTTPException(status_code=400, detail="Endereço Ethereum inválido")
        
        # Obter saldo
        balance_wei = w3.eth.get_balance(Web3.to_checksum_address(address))
        balance_eth = w3.from_wei(balance_wei, 'ether')
        
        # Obter contagem de transações
        tx_count = w3.eth.get_transaction_count(Web3.to_checksum_address(address))
        
        return {
            "address": address,
            "checksum_address": Web3.to_checksum_address(address),
            "balance": {
                "wei": str(balance_wei),
                "eth": float(balance_eth),
                "formatted": f"{float(balance_eth):.6f} ETH"
            },
            "transactions": {
                "count": tx_count,
                "next_nonce": tx_count
            },
            "network": {
                "name": "sepolia",
                "chain_id": 11155111,
                "symbol": "ETH"
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erro ao obter saldo da wallet {address}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao consultar blockchain: {str(e)}"
        )

@app.get("/api/blockchain/status")
async def blockchain_status():
    """Retorna status da conexão com a blockchain"""
    
    connected = w3.is_connected()
    status = {
        "connected": connected,
        "rpc_url": SEPOLIA_RPC[:50] + "..." if SEPOLIA_RPC and len(SEPOLIA_RPC) > 50 else SEPOLIA_RPC,
        "network_id": w3.eth.chain_id if connected else None,
        "latest_block": w3.eth.block_number if connected else None,
        "gas_price": str(w3.eth.gas_price) if connected else None,
        "syncing": w3.eth.syncing if connected else None
    }
    
    return status

if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Iniciando Wallet-Gated AI Agent v2.0...")
    logger.info(f"📡 Conectando à blockchain: {SEPOLIA_RPC}")
    
    # Testar conexão Web3
    if w3.is_connected():
        logger.info(f"✅ Conectado à Sepolia. Último bloco: {w3.eth.block_number}")
    else:
        logger.warning("⚠️  Não conectado à blockchain. Verifique RPC_URL")
    
    logger.info("�� Servidor iniciando em http://0.0.0.0:5000")
    logger.info("📚 Documentação disponível em http://localhost:5000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=5000,
        log_level="info",
        reload=False  # Alterar para True em desenvolvimento
    )
