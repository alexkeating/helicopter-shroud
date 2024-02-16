pragma solidity ^0.8.23;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {Time} from "@openzeppelin/contracts/utils/types/Time.sol";
import {Votes} from "@openzeppelin/contracts/governance/utils/Votes.sol";

contract ExampleToken is ERC20, ERC20Permit, ERC20Votes {
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20Permit(_name) ERC20(_name, _symbol) {}

    function mint(address _account, uint256 _amount) external {
        _mint(_account, _amount);
    }

    function nonces(address _owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return Nonces.nonces(_owner);
    }

    function _update(
        address _from,
        address _to,
        uint256 _value
    ) internal override(ERC20, ERC20Votes) {
        // The ERC20Votes _update method contains logic that checks the supply cap is not violated.
        ERC20Votes._update(_from, _to, _value);
    }
}
