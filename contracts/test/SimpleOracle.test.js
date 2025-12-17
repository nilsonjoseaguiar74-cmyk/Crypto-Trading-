const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleOracle", function () {
  let SimpleOracle, oracle, owner, user1, user2;
  
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    SimpleOracle = await ethers.getContractFactory("SimpleOracle");
    oracle = await SimpleOracle.deploy();
    
    await oracle.waitForDeployment();
  });
  
  describe("Deploy", function () {
    it("Should set the right owner", async function () {
      expect(await oracle.owner()).to.equal(owner.address);
    });
    
    it("Should have owner as authorized user", async function () {
      expect(await oracle.isUserAuthorized(owner.address)).to.be.true;
    });
    
    it("Should have 0 initial signals", async function () {
      expect(await oracle.getSignalCount()).to.equal(0);
    });
  });
  
  describe("User Management", function () {
    it("Should authorize a new user", async function () {
      await oracle.authorizeUser(user1.address, "premium");
      
      expect(await oracle.isUserAuthorized(user1.address)).to.be.true;
    });
    
    it("Should fail if non-owner tries to authorize", async function () {
      await expect(
        oracle.connect(user1).authorizeUser(user2.address, "premium")
      ).to.be.revertedWithCustomError(oracle, "OwnableUnauthorizedAccount");
    });
    
    it("Should revoke user authorization", async function () {
      await oracle.authorizeUser(user1.address, "premium");
      expect(await oracle.isUserAuthorized(user1.address)).to.be.true;
      
      await oracle.revokeUser(user1.address);
      expect(await oracle.isUserAuthorized(user1.address)).to.be.false;
    });
    
    it("Should get user profile", async function () {
      await oracle.authorizeUser(user1.address, "vip");
      
      const profile = await oracle.getUserProfile(user1.address);
      
      expect(profile.wallet).to.equal(user1.address);
      expect(profile.isAuthorized).to.be.true;
      expect(profile.tier).to.equal("vip");
    });
  });
  
  describe("Signal Generation", function () {
    beforeEach(async function () {
      await oracle.authorizeUser(user1.address, "premium");
    });
    
    it("Should generate a signal", async function () {
      const tx = await oracle.connect(user1).generateSignal(
        "BUY",
        "ETH",
        ethers.parseEther("2500"),
        85,
        "{\"rsi\": 30, \"volume\": \"high\"}"
      );
      
      await tx.wait();
      
      expect(await oracle.getSignalCount()).to.equal(1);
      
      const signal = await oracle.getSignal(0);
      expect(signal.action).to.equal("BUY");
      expect(signal.token).to.equal("ETH");
      expect(signal.confidence).to.equal(85n);
    });
    
    it("Should update user stats after generating signal", async function () {
      const profileBefore = await oracle.getUserProfile(user1.address);
      
      await oracle.connect(user1).generateSignal(
        "SELL",
        "BTC",
        ethers.parseEther("45000"),
        75,
        "{}"
      );
      
      const profileAfter = await oracle.getUserProfile(user1.address);
      expect(profileAfter.signalsGenerated).to.equal(profileBefore.signalsGenerated + 1n);
    });
    
    it("Should fail if unauthorized user tries to generate signal", async function () {
      await expect(
        oracle.connect(user2).generateSignal(
          "BUY",
          "ETH",
          ethers.parseEther("2500"),
          85,
          "{}"
        )
      ).to.be.revertedWith("SimpleOracle: usuario nao autorizado");
    });
    
    it("Should fail if confidence > 100", async function () {
      await expect(
        oracle.connect(user1).generateSignal(
          "BUY",
          "ETH",
          ethers.parseEther("2500"),
          101,
          "{}"
        )
      ).to.be.revertedWith("SimpleOracle: confianca deve ser <= 100");
    });
  });
  
  describe("Contract Stats", function () {
    beforeEach(async function () {
      await oracle.authorizeUser(user1.address, "premium");
      await oracle.authorizeUser(user2.address, "free");
    });
    
    it("Should return correct stats", async function () {
      // Gerar alguns sinais
      await oracle.connect(user1).generateSignal("BUY", "ETH", ethers.parseEther("2500"), 80, "{}");
      await oracle.connect(user1).generateSignal("SELL", "BTC", ethers.parseEther("45000"), 70, "{}");
      
      const stats = await oracle.getStats();
      
      expect(stats.totalSignals).to.equal(2n);
      expect(stats.totalUsers).to.equal(3n); // owner + user1 + user2
      expect(stats.activeUsers).to.equal(3n);
    });
  });
  
  describe("User Activity", function () {
    it("Should record user activity", async function () {
      await oracle.authorizeUser(user1.address, "premium");
      
      await oracle.connect(user1).recordActivity("wallet_connected");
      
      const profile = await oracle.getUserProfile(user1.address);
      expect(profile.lastActive).to.be.gt(0);
    });
  });
});
