// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleOracle
 * @dev Contrato oracle para validação de wallets e registro de sinais de trading
 */
contract SimpleOracle is Ownable {
    
    struct TradingSignal {
        string action;           // "BUY", "SELL", "HOLD"
        string token;            // "ETH", "BTC", etc
        uint256 price;           // Preço no momento do sinal (em wei ou USD*1e18)
        uint256 timestamp;       // Quando o sinal foi gerado
        address generatedBy;     // Quem gerou o sinal
        uint256 confidence;      // Confiança do sinal (0-100, onde 100 = 100%)
        string metadata;         // Metadados adicionais (JSON string)
    }
    
    struct UserProfile {
        address wallet;
        bool isAuthorized;
        uint256 joinDate;
        uint256 signalsGenerated;
        uint256 lastActive;
        string tier;            // "free", "premium", "vip"
    }
    
    // Mapeamentos
    mapping(address => bool) private _authorizedUsers;
    mapping(address => UserProfile) private _userProfiles;
    mapping(uint256 => TradingSignal) private _signals;
    
    // Arrays e contadores
    TradingSignal[] private _signalsArray;
    address[] private _userAddresses;
    
    uint256 private _signalCounter;
    uint256 private _userCounter;
    
    // Eventos
    event UserAuthorized(address indexed user, address indexed authorizer, uint256 timestamp);
    event UserRevoked(address indexed user, address indexed revoker, uint256 timestamp);
    event SignalGenerated(
        uint256 indexed signalId,
        address indexed generator,
        string action,
        string token,
        uint256 price,
        uint256 confidence,
        uint256 timestamp
    );
    event UserRegistered(address indexed user, uint256 timestamp);
    event UserActivity(address indexed user, string action, uint256 timestamp);
    
    // Modificadores
    modifier onlyAuthorized() {
        require(_authorizedUsers[msg.sender], "SimpleOracle: usuario nao autorizado");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "SimpleOracle: endereco invalido");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        _signalCounter = 0;
        _userCounter = 0;
        
        // Registrar o owner como usuário autorizado
        _registerUser(msg.sender, "vip");
    }
    
    /**
     * @dev Registra um novo usuário
     */
    function _registerUser(address user, string memory tier) internal validAddress(user) {
        require(_userProfiles[user].wallet == address(0), "SimpleOracle: usuario ja registrado");
        
        _userProfiles[user] = UserProfile({
            wallet: user,
            isAuthorized: true,
            joinDate: block.timestamp,
            signalsGenerated: 0,
            lastActive: block.timestamp,
            tier: tier
        });
        
        _authorizedUsers[user] = true;
        _userAddresses.push(user);
        _userCounter++;
        
        emit UserRegistered(user, block.timestamp);
        emit UserAuthorized(user, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Autoriza um usuário (somente owner)
     */
    function authorizeUser(address user, string memory tier) 
        external 
        onlyOwner 
        validAddress(user) 
    {
        if (_userProfiles[user].wallet == address(0)) {
            _registerUser(user, tier);
        } else {
            _authorizedUsers[user] = true;
            _userProfiles[user].isAuthorized = true;
            _userProfiles[user].lastActive = block.timestamp;
            _userProfiles[user].tier = tier;
            
            emit UserAuthorized(user, msg.sender, block.timestamp);
            emit UserActivity(user, "authorized", block.timestamp);
        }
    }
    
    /**
     * @dev Revoga autorização de um usuário
     */
    function revokeUser(address user) external onlyOwner validAddress(user) {
        require(_userProfiles[user].wallet != address(0), "SimpleOracle: usuario nao registrado");
        
        _authorizedUsers[user] = false;
        _userProfiles[user].isAuthorized = false;
        
        emit UserRevoked(user, msg.sender, block.timestamp);
        emit UserActivity(user, "revoked", block.timestamp);
    }
    
    /**
     * @dev Gera um novo sinal de trading
     */
    function generateSignal(
        string memory action,
        string memory token,
        uint256 price,
        uint256 confidence,
        string memory metadata
    ) 
        external 
        onlyAuthorized 
        returns (uint256) 
    {
        require(confidence <= 100, "SimpleOracle: confianca deve ser <= 100");
        require(price > 0, "SimpleOracle: preco deve ser > 0");
        
        uint256 signalId = _signalCounter;
        
        TradingSignal memory newSignal = TradingSignal({
            action: action,
            token: token,
            price: price,
            timestamp: block.timestamp,
            generatedBy: msg.sender,
            confidence: confidence,
            metadata: metadata
        });
        
        _signals[signalId] = newSignal;
        _signalsArray.push(newSignal);
        
        // Atualizar perfil do usuário
        _userProfiles[msg.sender].signalsGenerated++;
        _userProfiles[msg.sender].lastActive = block.timestamp;
        
        _signalCounter++;
        
        emit SignalGenerated(
            signalId,
            msg.sender,
            action,
            token,
            price,
            confidence,
            block.timestamp
        );
        
        emit UserActivity(msg.sender, "signal_generated", block.timestamp);
        
        return signalId;
    }
    
    /**
     * @dev Verifica se um usuário está autorizado
     */
    function isUserAuthorized(address user) external view validAddress(user) returns (bool) {
        return _authorizedUsers[user];
    }
    
    /**
     * @dev Obtém informações de um sinal específico
     */
    function getSignal(uint256 signalId) external view returns (
        string memory action,
        string memory token,
        uint256 price,
        uint256 timestamp,
        address generatedBy,
        uint256 confidence,
        string memory metadata
    ) {
        require(signalId < _signalCounter, "SimpleOracle: sinal inexistente");
        
        TradingSignal storage signal = _signals[signalId];
        
        return (
            signal.action,
            signal.token,
            signal.price,
            signal.timestamp,
            signal.generatedBy,
            signal.confidence,
            signal.metadata
        );
    }
    
    /**
     * @dev Obtém perfil de um usuário
     */
    function getUserProfile(address user) external view validAddress(user) returns (
        address wallet,
        bool isAuthorized,
        uint256 joinDate,
        uint256 signalsGenerated,
        uint256 lastActive,
        string memory tier
    ) {
        UserProfile storage profile = _userProfiles[user];
        require(profile.wallet != address(0), "SimpleOracle: usuario nao registrado");
        
        return (
            profile.wallet,
            profile.isAuthorized,
            profile.joinDate,
            profile.signalsGenerated,
            profile.lastActive,
            profile.tier
        );
    }
    
    /**
     * @dev Obtém estatísticas do contrato
     */
    function getStats() external view returns (
        uint256 totalSignals,
        uint256 totalUsers,
        uint256 activeUsers,
        uint256 latestSignalId
    ) {
        uint256 active = 0;
        for (uint256 i = 0; i < _userAddresses.length; i++) {
            if (_userProfiles[_userAddresses[i]].isAuthorized) {
                active++;
            }
        }
        
        return (
            _signalCounter,
            _userCounter,
            active,
            _signalCounter > 0 ? _signalCounter - 1 : 0
        );
    }
    
    /**
     * @dev Obtém todos os sinais (para frontend - use com cuidado em produção)
     */
    function getAllSignals() external view onlyOwner returns (TradingSignal[] memory) {
        return _signalsArray;
    }
    
    /**
     * @dev Atualiza tier de um usuário
     */
    function updateUserTier(address user, string memory newTier) external onlyOwner validAddress(user) {
        require(_userProfiles[user].wallet != address(0), "SimpleOracle: usuario nao registrado");
        
        _userProfiles[user].tier = newTier;
        _userProfiles[user].lastActive = block.timestamp;
        
        emit UserActivity(user, "tier_updated", block.timestamp);
    }
    
    /**
     * @dev Registra atividade do usuário
     */
    function recordActivity(string memory action) external onlyAuthorized {
        _userProfiles[msg.sender].lastActive = block.timestamp;
        emit UserActivity(msg.sender, action, block.timestamp);
    }
    
    /**
     * @dev Retorna o número total de sinais
     */
    function getSignalCount() external view returns (uint256) {
        return _signalCounter;
    }
    
    /**
     * @dev Retorna o número total de usuários
     */
    function getUserCount() external view returns (uint256) {
        return _userCounter;
    }
    
    /**
     * @dev Verifica se o contrato está operacional
     */
    function isOperational() external pure returns (bool) {
        return true;
    }
}
