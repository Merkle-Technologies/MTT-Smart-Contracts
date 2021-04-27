pragma solidity ^0.5.0;

import "./token/BEP20/BEP20Detailed.sol";
import "./token/BEP20/BEP20Burnable.sol";

contract MerkleToken is BEP20Burnable, BEP20Detailed {

    address public admin;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _admin
    ) public BEP20Detailed(_name, _symbol, _decimals) {
        admin = _admin;
        _totalSupply = 1000000000000000000000000000;            // Total Supply will be 1 Billion
        _balances[admin] = _totalSupply;
    }
}
