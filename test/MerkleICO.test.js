import { assert } from 'chai';
import EVMRevert from './helpers/EVMRevert';
import { ether, wei, BN } from './helpers/ether';
import { latestTime } from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';

const BigNumber = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MerkleICO = artifacts.require('MerkleICO');
const StableCoin = artifacts.require('StableCoin');
const MerkleToken = artifacts.require('MerkleToken');
const TokenTimelock = artifacts.require('TokenTimelock.sol');

contract('MerkleICO', function ([wallet, ICOWallet, investor1, investor2, investor3, investor4, foundersFund, marketingFund, companyFund, liquidityFund, rewardsFund, publicFund, icoFund, _]) {

  beforeEach(async function () {

    /******************* Token Configuration *******************/

    // Stable Coin
    this._decimalsStable = 18;
    this._symbolStable = "USDT";
    this._nameStable = "USDT Token";

    // Deploy Token
    this.stableCoin = await StableCoin.new(
      this._nameStable,
      this._symbolStable,
      this._decimalsStable
    );
    this.stableCoin.mint(investor1, ether(50000000));                // Mint Investor1 almost 5 Million USDT tokens so he can invest in ICO
    this.stableCoin.mint(investor2, ether(50000000));                // Mint Investor1 almost 5 Million USDT tokens so he can invest in ICO

    // Token config
    this.decimals = 18;
    this.symbol = "MTT";
    this.name = "Merkle Token";

    this.wallet = wallet;
    this.ICOWallet = ICOWallet;

    // Deploy Token
    this.token = await MerkleToken.new(
      this.name,
      this.symbol,
      this.decimals,
      this.wallet
    );
    await this.token.transfer(this.ICOWallet, ether('20000000'));     // 20 Million ICO Tokens Round 1

    /******************* ICO Configuration *******************/

    this.goal = ether('500000');                                          // Minimum USDT raise amount is 0.5 Million
    this.cap = ether('20000000');                                         // We want to Raise 2 Million USDT

    this.rate = ether(1);                                               // 1 MTT Token is equal to 1 USDT Token

    this.openingTime = (await latestTime()).timestamp + duration.seconds(10);
    this.closingTime = this.openingTime + duration.weeks(1);

    // Investor caps
    this.investorMinCap = ether('100');                                  // Mininmum investment is 100 USDT
    this.investorHardCap = ether('500000');                               // Hard Cap investment is 0.1 Million USDT

    // Pre ICO Stage Config
    this.preIcoStage = 0;
    this.preIcoRate = 250;

    // ICO Stage Config
    this.icoStage = 1;
    this.icoRate = 500;

    this.crowdsale = await MerkleICO.new(
      this.rate,
      this.wallet,
      this.token.address,
      this.cap,
      this.openingTime,
      this.closingTime,
      this.goal,
      this.stableCoin.address,
      this.ICOWallet
    );

    await this.token.approve(this.crowdsale.address, ether('20000000'), { from: this.ICOWallet });     // Approve ICO to transfer 20 Million tokens from ICO Wallet

    // Track refund vault
    this.escrowAddress = await this.crowdsale.escrow();
    // this.refundVault = RefundEscrow.at(this.escrowAddress);

    // Advance time to crowdsale start
    await increaseTimeTo(this.openingTime + 100);
  });

  describe('crowdsale', function () {
    it('tracks the rate', async function () {
      const rate = await this.crowdsale.rate();
      rate.toString().should.be.equal(this.rate.toString());
    });

    it('tracks the wallet', async function () {
      const wallet = await this.crowdsale.wallet();
      wallet.should.equal(this.wallet);
    });

    it('tracks the token', async function () {
      const token = await this.crowdsale.token();
      token.should.equal(this.token.address);
    });

    it('stable coin address', async function () {
      const usdtAddress = await this.crowdsale.USDT();
      usdtAddress.should.equal(this.stableCoin.address);
    });

    it('approve ICO to spend 20 Million tokens from ICO Wallet', async function () {
      let allowedToSpend = await this.token.allowance(this.ICOWallet, this.crowdsale.address);
      assert.equal(allowedToSpend.toString(), ether('20000000').toString());
    });
  });

  describe('capped crowdsale', async function () {

    it('has the correct hard cap', async function () {

      const cap = await this.crowdsale.cap();
      cap.toString().should.be.equal(this.cap.toString());
    });

    it('should be able to invest when invest is equal to hard cap', async function () {

      await this.stableCoin.approve(this.crowdsale.address, this.investorHardCap, { from: investor1 });
      await this.crowdsale.buyTokens(investor1, this.investorHardCap, { value: 0, from: investor1 });
    });

    it('should not be able to invest more than hard cap', async function () {

      await this.stableCoin.approve(this.crowdsale.address, (this.investorHardCap + ether(1)), { from: investor1 });
      await this.crowdsale.buyTokens(investor1, (this.investorHardCap + ether(1)), { value: 0, from: investor1 }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('when ico is not open', async function () {
    const currentTime = (await latestTime()).timestamp;
    it('should be able to invest', async function () {
      await this.stableCoin.approve(this.crowdsale.address, ether(1), { from: investor1 });
      await this.crowdsale.buyTokens(investor1, ether(1), { value: 0, from: investor1 });
      assert.isTrue(currentTime > this.openingTime);
    });
  });

  describe('timed crowdsale', function () {
    it('is open', async function () {
      const isClosed = await this.crowdsale.hasClosed();
      isClosed.should.be.false;
    });
  });

  describe('invest crowdsale before Goal', function () {
    beforeEach(async function () {

      this.investAmount = 200;
      this.tokenBalance = await this.token.balanceOf(investor1);
      this.stableBalance = await this.stableCoin.balanceOf(investor1);

      await this.stableCoin.approve(this.crowdsale.address, ether(this.investAmount), { from: investor1 });
      await this.crowdsale.buyTokens(investor1, ether(this.investAmount), { value: 0, from: investor1 });
    });

    it('transfer tokens to users escrow', async function () {

      let escrowBalance = wei(await this.crowdsale.balanceOf(investor1));
      let expectedTokens = this.investAmount / wei(this.rate);

      assert.equal(escrowBalance, expectedTokens);
    });

    it('stable coin check after purchase', async function () {

      let afterStable = await this.stableCoin.balanceOf(investor1);
      let difference = wei(this.stableBalance) - wei(afterStable);

      assert.equal(difference, this.investAmount);
    });
  });

  describe('refundable ICO', function () {
    beforeEach(async function () {
      await this.stableCoin.approve(this.crowdsale.address, this.investorMinCap, { from: investor1 });
      await this.crowdsale.buyTokens(investor1, this.investorMinCap, { value: 0, from: investor1 });

      // Advance time to crowdsale start //
      await increaseTimeTo(this.closingTime + 100);
      await this.crowdsale.finalize();
    });

    it('should not have completed goal', async function () {
      let goalReached = await this.crowdsale.goalReached();
      assert.equal(goalReached, false);
    });

    it('should refund investor funds', async function () {
      let beforeBalance = wei(await this.stableCoin.balanceOf(investor1));
      await this.crowdsale.claimRefund(investor1);

      let afterBalance = wei(await this.stableCoin.balanceOf(investor1));

      let difference = afterBalance - beforeBalance;
      assert.isTrue(difference == wei(this.investorMinCap));
    });
  });

  describe('when the crowdsale stage is ICO', function () {
    beforeEach(async function () {
      await this.crowdsale.setCrowdsaleStage(this.icoStage, { from: this.wallet });
      await this.stableCoin.approve(this.crowdsale.address, this.goal, { value: 0, from: investor1 });
      await this.crowdsale.buyTokens(investor1, this.goal, { value: 0, from: investor1 });

      this.oldBalance = wei(await this.stableCoin.balanceOf(this.wallet));

      await this.stableCoin.approve(this.crowdsale.address, this.investorMinCap, { value: 0, from: investor2 });
      await this.crowdsale.buyTokens(investor2, this.investorMinCap, { value: 0, from: investor2 });
    });

    it('should transfer Stable coin to admin', async function () {
      let newBalance = wei(await this.stableCoin.balanceOf(this.wallet));
      assert.isTrue(newBalance > this.oldBalance);
    });
  });

  describe('Goal reached finalized ICO', function () {
    beforeEach(async function () {
      await this.stableCoin.approve(this.crowdsale.address, this.investorMinCap, { value: 0, from: investor2 });
      await this.crowdsale.buyTokens(investor2, this.investorMinCap, { value: 0, from: investor2 });

      await this.stableCoin.approve(this.crowdsale.address, this.goal, { value: 0, from: investor1 });
      await this.crowdsale.buyTokens(investor1, this.goal, { value: 0, from: investor1 });

      await this.stableCoin.approve(this.crowdsale.address, this.investorMinCap, { value: 0, from: investor2 });
      await this.crowdsale.buyTokens(investor2, this.investorMinCap, { value: 0, from: investor2 });

      this.adminBalanceBefore = wei(await this.stableCoin.balanceOf(this.wallet));

      // Advance time to crowdsale start //
      await increaseTimeTo(this.closingTime + 100);
      await this.crowdsale.finalize();
    });

    it('should finalized ICO', async function () {
      let finalized = await this.crowdsale.finalized();
      assert.equal(finalized, true);
    });

    it('should not be able to refund', async function () {
      await this.crowdsale.claimRefund(investor1).should.be.rejectedWith(EVMRevert);
    });

    it('should transfer stable funds raised to admin', async function () {
      this.adminBalanceAfter = wei(await this.stableCoin.balanceOf(this.wallet));
      assert.isTrue(this.adminBalanceAfter > this.adminBalanceBefore);
    });
  });

  describe('extendTime', function () {
    beforeEach(async function () {
      const isClosed = await this.crowdsale.hasClosed();
      isClosed.should.be.false;
    });

    it('extends the closingTime', async function () {
      const oldClosingTime = await this.crowdsale.closingTime();

      const newClosingTime = await this.closingTime + duration.days(1);
      await this.crowdsale.extendTime(newClosingTime);

      const extendedClosingTime = await this.crowdsale.closingTime();
      expect(extendedClosingTime.toNumber()).to.be.above(oldClosingTime.toNumber());
    });
  });
});