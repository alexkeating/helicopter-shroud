// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.23;

import {MerkleDistributor} from "contract/MerkleDistributor.sol";

contract MerkleDistributorDeployer {
  function deploy(address _token, bytes32 _merkleRoot) external returns (address) {
    MerkleDistributor merkleDistributor = new MerkleDistributor(_token, _merkleRoot);
    return address(merkleDistributor);
  }
}
