pragma solidity ^0.8.23;

import "forge-std/Script.sol";
// modify this to have 0.8.23 to generate creation bytecode
import {MerkleDistributor} from "contract/MerkleDistributor.sol";
import {console2} from "forge-std/console2.sol";

contract Deploy is Script {
  function run() public {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    console2.logBytes(vm.getCode("MerkleDistributor.sol:MerkleDistributor"));
  }
}
