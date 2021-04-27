const MerkleToken = artifacts.require('./MerkleToken.sol');
const StableCoin = artifacts.require('./StableCoin.sol');
const MerkleICO = artifacts.require('./MerkleICO.sol');

module.exports = async function (deployer, network, accounts) {

  const ICOTokens = ether('50000000');                                                           // Total ICO Tokens that needs to be minted in this Round. Allow ICO to send tokens from main wallet to investors wallet
  const _icoPublicFundRound1 = (await web3.eth.getAccounts())[1];                                // TODO: Replace me: 50 Million for ICO
  // const _icoPublicFundRound1 = '0xbA2e20B08bb1efF117785A5738D5019E34a8b159';                     // TODO: Replace me: 50 Million for ICO

  /* Stable Coin */
  const _decimalsStable = 18;
  const _symbolStable = 'USDT';
  const _nameStable = 'USDT Token';

  await deployer.deploy(StableCoin, _nameStable, _symbolStable, _decimalsStable);

  const deployedStable = await StableCoin.deployed();
  deployedStable.mint('0xbA2e20B08bb1efF117785A5738D5019E34a8b159', ether(1000000));              // Mint Investor1 almost 1 Million USDT tokens so he can invest in ICO

  const deployedToken = await MerkleToken.deployed();

  const _token = deployedToken.address;
  const _stable = '0x55d398326f99059ff775485246999027b3197955';                                     // This is USDT Mainnet BSC Wallet
  const _wallet = '0xE4e99475E100b6E444e73c620947E89808Cf3659';                                     // TODO: This wallet will receive USDT Invested

  // const _openingTime = (await web3.eth.getBlock('latest')).timestamp + duration.days(15);      // 15 Days to Start ICO
  // const _closingTime = _openingTime + duration.days(15);                                       // 60 Days ICO Duration

  // const _cap = ether('50000000');                                                              // We want to raise 50 Million USDT
  // const _goal = ether('500000');                                                               // Min goal 0.5 Million USDT we want to raise

  const _openingTime = (await web3.eth.getBlock('latest')).timestamp + duration.minutes(3);       // 5 Minutes to Start ICO *******
  const _closingTime = _openingTime + duration.hours(5);                                       // 60 Days ICO Duration

  const _cap = ether('50');
  const _goal = ether('25');

  const _rate = ether("1");                                                                     // Per token price is 1 USDT

  await deployer.deploy(
    MerkleICO,
    _rate,
    _wallet,
    _token,
    _cap,
    _openingTime,
    _closingTime,
    _goal,
    // _stable,
    deployedStable.address,
    _icoPublicFundRound1
  );

  const deployedICO = await MerkleICO.deployed();
  await deployedToken.approve(deployedICO.address, ICOTokens, { from: _icoPublicFundRound1 });

  return true;
};

const ether = (n) => new web3.utils.BN(web3.utils.toWei(n.toString(), 'ether'));

const duration = {
  seconds: function (val) { return val; },
  minutes: function (val) { return val * this.seconds(60); },
  hours: function (val) { return val * this.minutes(60); },
  days: function (val) { return val * this.hours(24); },
  weeks: function (val) { return val * this.days(7); },
  months: function (val) { return val * this.days(30); },
  years: function (val) { return val * this.days(365); },
};