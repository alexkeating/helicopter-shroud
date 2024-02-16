pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import {ERC5564Announcer} from "stealth-address-erc-contracts/ERC5564Announcer.sol";
import {ERC6538Registry} from "stealth-address-erc-contracts/ERC6538Registry.sol";
import {MerkleDistributorDeployer} from "contract/MerkleDistributorDeployer.sol";
import {ExampleToken} from "contract/ExampleToken.sol";

contract Deploy is Script {
  function run() public {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);
    //new ERC5564Announcer();
    //new ERC6538Registry();
    //new MerkleDistributorDeployer();
    // should be uncommented to setup a distributor
    new ExampleToken("Example token", "EXA");
  }
}
