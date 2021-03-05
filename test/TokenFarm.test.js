const { assert } = require("chai");

const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

require("chai")
  .use(require("chai-as-promised"))
  .should();

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}
contract("TokenFarm", ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm;

  before(async () => {
    //load contracts
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    //transfer all d app tokens to farm
    await dappToken.transfer(tokenFarm.address, tokens("1000000"));
    //send tokens to investor

    await daiToken.transfer(investor, tokens("100"), { from: owner });
  });

  describe("Mock DAI deployment", async () => {
    it("has a name", async () => {
      const name = await daiToken.name();
      assert.equal(name, "Mock DAI Token");
    });
  });
  describe("Dapp Token deployment", async () => {
    it("has a name", async () => {
      const name = await dappToken.name();
      assert.equal(name, "DApp Token");
    });
  });
  describe("TokenFarm deployment", async () => {
    it("has a name", async () => {
      const name = await tokenFarm.name();
      assert.equal(name, "Token Farm");
    });
    it("has tokens", async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokens("1000000"));
    });
  });
  describe("Farming tokens", async () => {
    it("rewards investors for staking mDai tokens", async () => {
      let result;
      //check investor balance for staking
      result = await daiToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "investor wallet balance correct before staking"
      );
      //approve then stake mock dai
      await daiToken.approve(tokenFarm.address, tokens("100"), {
        from: investor,
      });
      await tokenFarm.stakeTokens(tokens("100"), { from: investor });
      //check tokens transferred successfully
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokens("0"), "investor balance 0");

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(result.toString(), tokens("100"), "farm balance 100");

      //check that user is staking and has a staking balance
      result = await tokenFarm.isStaking(investor);
      assert.equal(result.toString(), "true", "investor is staking");

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "Farm has staked tokens now"
      );
    });
    it("issues Dapp tokens to investors with staked balances", async () => {
      let result;
      // If investor tries to call issue token function, reject it
      await tokenFarm.issueToken({ from: investor }).should.be.rejected;

      await tokenFarm.issueToken({ from: owner });
      result = await dappToken.balanceOf(investor);
      assert.equal(
        result.toString(),
        tokens("100"),
        "user gained 100 dapp tokens for staking"
      );
    });
    it("allows investors to unstake their dai", async () => {
      let result;

      //Dont allow user to unstake more than they have or less than 0
      await tokenFarm.unStakeTokens(tokens("0"), { from: investor }).should.be
        .rejected;
      await tokenFarm.unStakeTokens(tokens("101"), { from: investor }).should.be
        .rejected;

      //partially unstake
      await tokenFarm.unStakeTokens(tokens("50"), { from: investor });
      //check if user has remaining stake and is staking
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokens("50"), "Dai balance 50");

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(result.toString(), tokens("50"), "Staking balance 50");

      result = await tokenFarm.isStaking(investor);
      assert.equal(result.toString(), "true", "Still staking");

      //completely unstake
      await tokenFarm.unStakeTokens(tokens("50"), { from: investor });

      //check if completely  unstaked
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokens("100"), "Dai balance 0");

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(result.toString(), tokens("0"), "Staking balance 0");

      result = await tokenFarm.isStaking(investor);
      assert.equal(result.toString(), "false", "Not staking");
    });
  });
});
