// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "circuits/contract/with_foundry/plonk_vk.sol";


// This should match the Uniswap merkle distributor
// the difference is the claim works like a stealth address

contract Starter {
    UltraVerifier public verifier;

    constructor(UltraVerifier _verifier) {
        verifier = _verifier;
    }

    function verifyEqual(bytes calldata proof, bytes32[] calldata y) public view returns (bool) {
        bool proofResult = verifier.verify(proof, y);
        require(proofResult, "Proof is not valid");
        return proofResult;
    }
}
