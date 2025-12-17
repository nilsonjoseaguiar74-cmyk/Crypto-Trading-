#!/bin/bash
echo "🚀 WALLET-GATED AI - STARTING PROJECT"
echo "====================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}1. Checking environment...${NC}"

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
else
    echo -e "${RED}❌ Node.js not installed${NC}"
    exit 1
fi

# Check Python
if command -v python3 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Python: $(python3 --version)${NC}"
else
    echo -e "${RED}❌ Python3 not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}2. Installing dependencies...${NC}"

# Frontend dependencies
if [ -f "package.json" ]; then
    echo "Installing Node.js dependencies..."
    npm install
else
    echo -e "${RED}❌ package.json not found${NC}"
fi

# Backend dependencies
if [ -f "agent/requirements.txt" ]; then
    echo "Installing Python dependencies..."
    cd agent
    pip install -r requirements.txt
    cd ..
else
    echo -e "${YELLOW}⚠️  agent/requirements.txt not found${NC}"
fi

echo -e "${YELLOW}3. Checking environment configuration...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env from example${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env with your configuration${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file found${NC}"
fi

echo -e "${YELLOW}4. Project structure:${NC}"
echo "Frontend: React + TypeScript + Vite (Port 5173)"
echo "Backend: Python FastAPI (Port 5000)"
echo "Contracts: Solidity + Hardhat"

echo -e "${YELLOW}5. Starting instructions:${NC}"
echo ""
echo -e "${GREEN}TERMINAL 1 - Frontend:${NC}"
echo "  npm run dev"
echo "  → http://localhost:5173"
echo ""
echo -e "${GREEN}TERMINAL 2 - Backend:${NC}"
echo "  cd agent"
echo "  python agent_mvp.py"
echo "  → http://localhost:5000"
echo ""
echo -e "${GREEN}TERMINAL 3 - Contracts (optional):${NC}"
echo "  cd contracts"
echo "  npm install"
echo "  npx hardhat compile"
echo ""
echo -e "${YELLOW}6. Quick test:${NC}"
echo "  curl http://localhost:5000/health"
echo "  curl http://localhost:5000/api/signal/generate"

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
