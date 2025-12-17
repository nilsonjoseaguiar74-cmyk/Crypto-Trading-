const hre = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy do SimpleOracle...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("🔑 Conta de deploy:", deployer.address);
  console.log("💰 Saldo:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  // Compilar contrato
  console.log("📦 Compilando contrato...");
  const SimpleOracle = await hre.ethers.getContractFactory("SimpleOracle");
  
  // Fazer deploy
  console.log("🚀 Fazendo deploy...");
  const oracle = await SimpleOracle.deploy();
  
  await oracle.waitForDeployment();
  const address = await oracle.getAddress();
  
  console.log("✅ SimpleOracle deployado em:", address);
  console.log("📄 Transaction hash:", oracle.deploymentTransaction().hash);
  
  // Verificar no Etherscan (se API key configurada)
  if (hre.network.name === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("⏳ Aguardando 5 blocos para verificação...");
    await oracle.deploymentTransaction().wait(5);
    
    console.log("🔍 Verificando contrato no Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contrato verificado no Etherscan!");
    } catch (error) {
      console.log("⚠️  Verificação falhou:", error.message);
    }
  }
  
  // Salvar informações do deploy
  const deployInfo = {
    network: hre.network.name,
    contract: "SimpleOracle",
    address: address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    chainId: (await hre.ethers.provider.getNetwork()).chainId
  };
  
  console.log("\n📊 Informações do deploy:");
  console.log(JSON.stringify(deployInfo, null, 2));
  
  console.log("\n🎉 Deploy concluído com sucesso!");
  console.log("\n🔗 URLs:");
  console.log(`   Etherscan: https://sepolia.etherscan.io/address/${address}`);
  console.log(`   Contract Interface: https://sepolia.etherscan.io/address/${address}#code`);
  
  console.log("\n📝 Próximos passos:");
  console.log("   1. Copie o endereço do contrato para o arquivo .env");
  console.log("   2. Configure as permissões no frontend");
  console.log("   3. Teste as funções do contrato");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
