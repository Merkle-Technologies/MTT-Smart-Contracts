const MerkleToken = artifacts.require('./MerkleToken.sol');
const TokenTimelock = artifacts.require('./TokenTimelock.sol');

// First create the token

// Mint token into timelock telling about 
module.exports = async function (deployer, network, accounts) {

  const _foundersFund = "0xbA2e20B08bb1efF117785A5738D5019E34a8b159";                            // TODO: Replace me: 100 Million & Lock
  const _marketingFund = "0xbA2e20B08bb1efF117785A5738D5019E34a8b159";                           // TODO: Replace me: 100 Million & Lock
  const _companyFund = "0xbA2e20B08bb1efF117785A5738D5019E34a8b159";                             // TODO: Replace me: 200 Million & Lock
  const _liquidityFund = "0xbA2e20B08bb1efF117785A5738D5019E34a8b159";                           // TODO: Replace me: 150 Million & Lock
  const _rewardsFund = "0xbA2e20B08bb1efF117785A5738D5019E34a8b159";                             // TODO: Replace me: 50 Million & Lock

  const _icoPublicFundRound1 = (await web3.eth.getAccounts())[1];                                            // TODO: Replace me: 50 Million for ICO
  // const _icoPublicFundRound1 = '0xbA2e20B08bb1efF117785A5738D5019E34a8b159';                                 // TODO: Replace me: 50 Million for ICO
  const _icoPrivateFundRound1 = "0xbA2e20B08bb1efF117785A5738D5019E34a8b159";                                // TODO: Replace me: 100 Million for ICO
  const _icoPublicFundRound2 = "0xbA2e20B08bb1efF117785A5738D5019E34a8b159";                                 // TODO: Replace me: 100 Million for ICO
  const _icoPublicFundRound3 = "0xbA2e20B08bb1efF117785A5738D5019E34a8b159";                                 // TODO: Replace me: 100 Million for ICO
  const _icoPrivateFundRound3 = "0xbA2e20B08bb1efF117785A5738D5019E34a8b159";                                // TODO: Replace me: 50 Million for ICO

  /* MERKLE Token */
  const _decimals = 18;
  const _symbol = 'MTT';
  const _name = 'Merkle Token';
  const _admin = (await web3.eth.getAccounts())[0];                                                     // TODO: Replace me
  // const _admin = "0x0aC97F09C4B6500C9ca3e32a86c7CFd6A213c587";                                       // TODO: Replace me

  const _totalSupply = '1000000000';

  await deployer.deploy(MerkleToken, _name, _symbol, _decimals, _admin);

  const deployedToken = await MerkleToken.deployed();
  // const _releaseTimeFounder = (await web3.eth.getBlock('latest')).timestamp + duration.years(3);                        // 3 Year Founder Tokens Timelock
  const _releaseTimeFounder = (await web3.eth.getBlock('latest')).timestamp + duration.minutes(11);                        // 3 Year Founder Tokens Timelock
  const foundersTimelock = await deployer.deploy(TokenTimelock, deployedToken.address, _foundersFund, _releaseTimeFounder);
  await deployedToken.transfer(foundersTimelock.address, ether(_totalSupply * 0.1));

  await deployedToken.transfer(_marketingFund, ether(_totalSupply * 0.1));

  // const _releaseTimeCompany = (await web3.eth.getBlock('latest')).timestamp + duration.years(1);                                              // 1 Year Reserve Tokens Timelock
  const _releaseTimeCompany = (await web3.eth.getBlock('latest')).timestamp + duration.minutes(11);                                              // 1 Year Reserve Tokens Timelock
  const companyTimelock = await deployer.deploy(TokenTimelock, deployedToken.address, _companyFund, _releaseTimeCompany);
  await deployedToken.transfer(companyTimelock.address, ether(_totalSupply * 0.2));

  await deployedToken.transfer(_liquidityFund, ether(_totalSupply * 0.15));

  await deployedToken.transfer(_rewardsFund, ether(_totalSupply * 0.05));

  await deployedToken.transfer(_icoPublicFundRound1, ether(_totalSupply * 0.05));

  await deployedToken.transfer(_icoPrivateFundRound1, ether(_totalSupply * 0.1));

  const _releaseTimePublicRound2 = (await web3.eth.getBlock('latest')).timestamp + duration.minutes(11);                                        // 6 Months Reserve Tokens Timelock
  // const _releaseTimePublicRound2 = (await web3.eth.getBlock('latest')).timestamp + duration.months(6);                                        // 6 Months Reserve Tokens Timelock
  const publicTimelockRound2 = await deployer.deploy(TokenTimelock, deployedToken.address, _icoPublicFundRound2, _releaseTimePublicRound2);
  await deployedToken.transfer(publicTimelockRound2.address, ether(_totalSupply * 0.1));

  const _releaseTimePublicRound3 = (await web3.eth.getBlock('latest')).timestamp + duration.minutes(11);                    // 1 year 6 Months Reserve Tokens Timelock
  // const _releaseTimePublicRound3 = (await web3.eth.getBlock('latest')).timestamp + duration.years(1) + duration.months(6);                    // 1 year 6 Months Reserve Tokens Timelock
  const publicTimeLockRound3 = await deployer.deploy(TokenTimelock, deployedToken.address, _icoPublicFundRound3, _releaseTimePublicRound3);
  await deployedToken.transfer(publicTimeLockRound3.address, ether(_totalSupply * 0.1));

  const _releaseTimePrivateRound3 = (await web3.eth.getBlock('latest')).timestamp + duration.minutes(11);                       // 1 year 6 Months Reserve Tokens Timelock
  // const _releaseTimePrivateRound3 = (await web3.eth.getBlock('latest')).timestamp + duration.years(1) + duration.months(6);                       // 1 year 6 Months Reserve Tokens Timelock
  const privateTimeLockRound3 = await deployer.deploy(TokenTimelock, deployedToken.address, _icoPrivateFundRound3, _releaseTimePrivateRound3);
  await deployedToken.transfer(privateTimeLockRound3.address, ether(_totalSupply * 0.05));


  console.log('***************************Founder Fund Address = ', _foundersFund);
  console.log('***************************Marketing Fund Address = ', _marketingFund);
  console.log('***************************Company Fund Address = ', _companyFund);
  console.log('***************************Liquidity Fund Address = ', _liquidityFund);
  console.log('***************************Rewards Fund Address = ', _rewardsFund);
  console.log('***************************ICO Round 1 Public Wallet = ', _icoPublicFundRound1);
  console.log('***************************ICO Round 1 Private Wallet = ', _icoPrivateFundRound1);
  console.log('***************************ICO Round 2 Public Wallet = ', _icoPublicFundRound2);
  console.log('***************************ICO Round 3 Public Wallet = ', _icoPublicFundRound3);
  console.log('***************************ICO Round 3 Private Wallet = ', _icoPrivateFundRound3);


  console.log('---------------------------------------------------------------------------------');


  console.log('***************************Founders Timelock Address = ', foundersTimelock.address);
  console.log('***************************Company Timelock Address = ', companyTimelock.address);
  console.log('***************************ICO Round 2 Public Timelock Address = ', publicTimelockRound2.address);
  console.log('***************************ICO Round 3 Public Timelock Address = ', publicTimeLockRound3.address);
  console.log('***************************ICO Round 3 Private Timelock Address = ', privateTimeLockRound3.address);
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
