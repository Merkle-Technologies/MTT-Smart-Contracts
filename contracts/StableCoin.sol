pragma solidity ^0.5.0;

import "./token/BEP20/BEP20Detailed.sol";
import "./token/BEP20/BEP20Mintable.sol";
import "./token/BEP20/BEP20Burnable.sol";

contract StableCoin is BEP20Mintable, BEP20Burnable, BEP20Detailed {
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) public BEP20Detailed(_name, _symbol, _decimals) {}
}
