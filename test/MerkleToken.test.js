import { assert } from 'chai';
import { ether, wei, BN } from './helpers/ether';
import EVMRevert from './helpers/EVMRevert';
import { latestTime } from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';

const BigNumber = web3.utils.BN;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const MerkleToken = artifacts.require('MerkleToken');
const TokenTimelock = artifacts.require('TokenTimelock');

contract('MerkleToken', function ([wallet, foundersFund, marketingFund, companyFund, 
                                  liquidityFund, rewardsFund, _icoPublicFundRound1, 
                                  _icoPrivateFundRound1, _icoPublicFundRound2, _icoFundRound3]) {

  beforeEach(async function () {

    // Token config
    this.decimals = 18;
    this.symbol = "MTT";
    this.name = "Merkle Token";

    this.wallet = wallet;

    // Deploy Token
    this.token = await MerkleToken.new(
      this.name,
      this.symbol,
      this.decimals,
      this.wallet
    );

    this.foundersFund = foundersFund;                             // TODO: Replace me: 100 Million & Lock
    this.marketingFund = marketingFund;                           // TODO: Replace me: 100 Million & Lock
    this.companyFund = companyFund;                               // TODO: Replace me: 200 Million & Lock
    this.liquidityFund = liquidityFund;                           // TODO: Replace me: 150 Million & Lock
    this.rewardsFund = rewardsFund;                               // TODO: Replace me: 50 Million & Lock
    this._icoPublicFundRound1 = _icoPublicFundRound1;             // TODO: Replace me: 50 Million for ICO
    this._icoPrivateFundRound1 = _icoPrivateFundRound1;           // TODO: Replace me: 100 Million for ICO
    this._icoPublicFundRound2 = _icoPublicFundRound2;             // TODO: Replace me: 100 Million for ICO
    this._icoFundRound3 = _icoFundRound3;                         // TODO: Replace me: 150 Million for ICO

    this.totalSupply = "1000000000";

    this._releaseTimeFounder = (await web3.eth.getBlock('latest')).timestamp + duration.years(3);                                       // 3 Year Founder Tokens Timelock
    this.foundersTimelock = await TokenTimelock.new(this.token.address, this.foundersFund, this._releaseTimeFounder);
    await this.token.transfer(this.foundersTimelock.address, ether(this.totalSupply * 0.1));

    await this.token.transfer(this.marketingFund, ether(this.totalSupply * 0.1));

    this._releaseTimeCompany = (await web3.eth.getBlock('latest')).timestamp + duration.years(1);                                       // 1 Year Reserve Tokens Timelock
    this.companyTimelock = await TokenTimelock.new(this.token.address, this.companyFund, this._releaseTimeCompany);
    await this.token.transfer(this.companyTimelock.address, ether(this.totalSupply * 0.2));

    await this.token.transfer(this.liquidityFund, ether(this.totalSupply * 0.15));

    await this.token.transfer(this.rewardsFund, ether(this.totalSupply * 0.05));

    await this.token.transfer(this._icoPublicFundRound1, ether(this.totalSupply * 0.05));
  
    await this.token.transfer(this._icoPrivateFundRound1, ether(this.totalSupply * 0.1));
  
    this._releaseTimePublicRound2 = (await web3.eth.getBlock('latest')).timestamp + duration.months(6);                                 // 6 Months Reserve Tokens Timelock
    this.publicTimelockRound2 = await TokenTimelock.new(this.token.address, this._icoPublicFundRound2, this._releaseTimePublicRound2);
    await this.token.transfer(this.publicTimelockRound2.address, ether(this.totalSupply * 0.1));
  
    this._releaseTimeRound3 = (await web3.eth.getBlock('latest')).timestamp + duration.years(1) + duration.months(6);                   // 1 year 6 Months Reserve Tokens Timelock
    this.timeLockRound3 = await TokenTimelock.new(this.token.address, this._icoFundRound3, this._releaseTimeRound3);
    await this.token.transfer(this.timeLockRound3.address, ether(this.totalSupply * 0.15));
  });

  describe('Token Parameters', function () {
    it('check the symbol', async function () {
      const symbol = await this.token.symbol();
      symbol.toString().should.be.equal(this.symbol.toString());
    });

    it('check the name', async function () {
      const name = await this.token.name();
      name.toString().should.be.equal(this.name.toString());
    });

    it('check the decimals', async function () {
      const decimals = await this.token.decimals();
      decimals.toString().should.be.equal(this.decimals.toString());
    });
  });

  describe('Pre Minted', function () {
    it('check the admin wallet', async function () {
      const wallet = await this.token.admin();
      wallet.should.be.equal(this.wallet);
    });

    it('total supply should be 1 billion', async function () {
      const totalSupply = await this.token.totalSupply();
      assert.equal(BN(totalSupply), ether('1000000000'));
    });

    it('founder should have 100 Million and then Lock', async function () {

      let founderTokens = BN(await this.token.balanceOf(this.foundersTimelock.address));
      assert.equal(founderTokens, ether('100000000'));

      let beneficiary = await this.foundersTimelock.beneficiary();
      assert.equal(beneficiary, foundersFund);
    });

    it('marketing should have 100 Million and then Lock', async function () {

      let publicToken = wei(await this.token.balanceOf(this.marketingFund));
      assert.equal(publicToken, '100000000');
    });

    it('company should have 200 Million and then Lock', async function () {

      let companyToken = wei(await this.token.balanceOf(this.companyTimelock.address));
      assert.equal(companyToken, '200000000');

      let beneficiary = await this.companyTimelock.beneficiary();
      assert.equal(beneficiary, this.companyFund);
    });

    it('liquidity wallet should have 150 Million and then Lock', async function () {

      let liquidityToken = wei(await this.token.balanceOf(this.liquidityFund));
      assert.equal(liquidityToken, '150000000');
    });

    it('reward wallet should have 50 Million and then Lock', async function () {

      let rewardToken = wei(await this.token.balanceOf(this.rewardsFund));
      assert.equal(rewardToken, '50000000');
    });

    it('transfer 50 Million to ICO Public Funds Round 1 Wallet', async function () {

      let tokenBalance = wei(await this.token.balanceOf(this._icoPublicFundRound1));
      assert.equal(tokenBalance, '50000000');
    });

    it('transfer 100 Million to ICO Private Funds Round 1 Wallet', async function () {

      let tokenBalance = wei(await this.token.balanceOf(this._icoPrivateFundRound1));
      assert.equal(tokenBalance, '100000000');
    });

    it('should have 100 Million in ICO Public Funds Round 2 Wallet', async function () {

      let tokenBalance = wei(await this.token.balanceOf(this.publicTimelockRound2.address));
      assert.equal(tokenBalance, '100000000');

      let beneficiary = await this.publicTimelockRound2.beneficiary();
      assert.equal(beneficiary, this._icoPublicFundRound2);
    });

    it('should have 150 Million in ICO Funds Round 3 Wallet', async function () {

      let tokenBalance = wei(await this.token.balanceOf(this.timeLockRound3.address));
      assert.equal(tokenBalance, '150000000');

      let beneficiary = await this.timeLockRound3.beneficiary();
      assert.equal(beneficiary, this._icoFundRound3);
    });
  });
});