pragma solidity ^0.5.0;

import "./BEP20.sol";
import "../../access/roles/MinterRole.sol";

/**
 * @dev Extension of {BEP20} that adds a set of accounts with the {MinterRole},
 * which have permission to mint (create) new tokens as they see fit.
 *
 * At construction, the deployer of the contract is the only minter.
 */
contract BEP20Mintable is BEP20, MinterRole {
    /**
     * @dev See {BEP20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the {MinterRole}.
     */
    function mint(address account, uint256 amount) public onlyMinter returns (bool) {
        _mint(account, amount);
        return true;
    }
}
