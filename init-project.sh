#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   WALLET-GATED AI - INIT SCRIPT        ${NC}"
echo -e "${BLUE}========================================${NC}"

print_step() {
    echo -e "\n${YELLOW}[$1]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 1. Verificar diretório
print_step "1" "Verificando diretório do projeto..."
if [ ! -f "package.json" ]; then
    print_error "Não está no diretório do projeto Wallet-Gated AI"
    exit 1
fi
print_success "Diretório correto: $(pwd)"

# 2. Verificar e instalar dependências do frontend
print_step "2" "Verificando dependências do frontend..."
if [ ! -d "node_modules" ]; then
    print_info "Instalando node_modules..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependências do frontend instaladas"
    else
        print_error "Falha ao instalar dependências do frontend"
        exit 1
    fi
else
    print_success "node_modules já existe"
fi

# 3. Verificar e configurar backend Python
print_step "3" "Configurando backend Python..."
if [ -d "agent" ]; then
    cd agent
    
    # Verificar se requirements.txt existe
    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt não encontrado em agent/"
        exit 1
    fi
    
    # Criar/ativar venv
    if [ ! -d "venv" ]; then
        print_info "Criando ambiente virtual Python..."
        python3 -m venv venv
    fi
    
    print_info "Ativando venv e instalando pacotes..."
    source venv/bin/activate
    
    # Instalar/atualizar pacotes
    pip install --upgrade pip
    pip install -r requirements.txt
    
    if [ $? -eq 0 ]; then
        print_success "Dependências do backend instaladas"
    else
        print_error "Falha ao instalar dependências do backend"
        exit 1
    fi
    
    cd ..
else
    print_error "Pasta 'agent' não encontrada"
    exit 1
fi

# 4. Verificar configuração do ambiente
print_step "4" "Verificando configuração de ambiente..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_info "Criando .env a partir do exemplo..."
        cp .env.example .env
        print_success ".env criado. ${RED}EDITAR COM SUAS CONFIGURAÇÕES!${NC}"
    else
        print_error ".env.example não encontrado"
        exit 1
    fi
else
    print_success ".env já existe"
fi

# 5. Verificar contratos
print_step "5" "Verificando smart contracts..."
if [ -d "contracts" ]; then
    cd contracts
    
    if [ -f "package.json" ]; then
        if [ ! -d "node_modules" ]; then
            print_info "Instalando dependências dos contratos..."
            npm install
        else
            print_success "Contratos já configurados"
        fi
    else
        print_info "Estrutura de contratos encontrada, mas package.json faltando"
    fi
    
    cd ..
else
    print_info "Pasta 'contracts' não encontrada - pular"
fi

# 6. Resumo final
print_step "6" "Resumo da configuração:"
echo ""
echo -e "${GREEN}✅ Frontend (React/Vite):${NC}"
echo "   - Dependências: $( [ -d "node_modules" ] && echo "Instaladas" || echo "Faltando" )"
echo "   - Porta: 5173"
echo ""
echo -e "${GREEN}✅ Backend (Python/FastAPI):${NC}"
echo "   - Dependências: Instaladas"
echo "   - Ambiente: $( [ -d "agent/venv" ] && echo "venv ativo" || echo "Não configurado" )"
echo "   - Porta: 5000"
echo ""
echo -e "${GREEN}✅ Smart Contracts:${NC}"
echo "   - Estrutura: $( [ -d "contracts" ] && echo "Presente" || echo "Faltando" )"
echo "   - Dependências: $( [ -d "contracts/node_modules" ] && echo "Instaladas" || echo "Faltando" )"
echo ""
echo -e "${GREEN}✅ Ambiente:${NC}"
echo "   - .env: $( [ -f ".env" ] && echo "Configurado" || echo "Faltando" )"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}         PRÓXIMOS PASSOS               ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}1. CONFIGURAR .env:${NC}"
echo "   Edite o arquivo .env com:"
echo "   - SEPOLIA_RPC_URL (Infura/Alchemy)"
echo "   - PRIVATE_KEY (sua chave privada)"
echo "   - CONTRACT_ADDRESS (após deploy)"
echo ""
echo -e "${YELLOW}2. INICIAR BACKEND (Terminal 1):${NC}"
echo "   cd agent"
echo "   source venv/bin/activate"
echo "   python agent_mvp.py"
echo ""
echo -e "${YELLOW}3. INICIAR FRONTEND (Terminal 2):${NC}"
echo "   npm run dev"
echo ""
echo -e "${YELLOW}4. ACESSAR:${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:5000"
echo "   API Docs: http://localhost:5000/docs"
echo ""
echo -e "${YELLOW}5. DEPLOY CONTRATOS (Opcional):${NC}"
echo "   cd contracts"
echo "   npx hardhat compile"
echo "   npx hardhat run scripts/deploy.js --network sepolia"
echo ""
echo -e "${GREEN}✅ Configuração concluída!${NC}"
