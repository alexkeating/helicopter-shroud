// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.23;

import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";
import {IMerkleDistributor} from "merkle-distributor/interfaces/IMerkleDistributor.sol";


contract MerkleDistributor is IMerkleDistributor, EIP712, Nonces {
    using SafeERC20 for IERC20;

    error AlreadyClaimed();
    error InvalidProof();

    error InvalidClaimSignature(address);
    error InvalidFee(uint256);

    address public immutable override token;
    bytes32 public immutable override merkleRoot;

    // This is a packed array of booleans.
    mapping(uint256 => uint256) private claimedBitMap;

    bytes32 public constant CLAIM_TYPEHASH =
        keccak256("Claim(uint256 index,address account,uint256 amount, uint256 fee, uint256 nonce)");

    constructor(address token_, bytes32 merkleRoot_) EIP712("MerkleDistributor", "1") {
        token = token_;
        merkleRoot = merkleRoot_;
    }

    function isClaimed(uint256 index) public view override returns (bool) {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        uint256 claimedWord = claimedBitMap[claimedWordIndex];
        uint256 mask = (1 << claimedBitIndex);
        return claimedWord & mask == mask;
    }

    function _setClaimed(uint256 index) private {
        uint256 claimedWordIndex = index / 256;
        uint256 claimedBitIndex = index % 256;
        claimedBitMap[claimedWordIndex] = claimedBitMap[claimedWordIndex] | (1 << claimedBitIndex);
    }

    function claim(uint256 index, address account, uint256 amount, bytes32[] calldata merkleProof)
        public
        virtual
        override
    {
        if (isClaimed(index)) revert AlreadyClaimed();

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, account, amount));
        if (!MerkleProof.verify(merkleProof, merkleRoot, node)) revert InvalidProof();

        // Mark it claimed and send the token.
        _setClaimed(index);
        IERC20(token).safeTransfer(account, amount);

        emit Claimed(index, account, amount);
    }

    /// @dev This will allow a claim and send some portion to a relayer.
    function claimBySig(uint256 index, address account, uint256 amount, uint256 fee, bytes32[] calldata merkleProof, bytes memory signature)
        public
        virtual
    {
        bool valid = SignatureChecker.isValidSignatureNow(
             account,
            _hashTypedDataV4(keccak256(abi.encode(CLAIM_TYPEHASH, index, account, amount, fee, _useNonce(account)))),
            signature
        );

        if (!valid) {
            revert InvalidClaimSignature(account);
        }
        if (fee > amount) revert InvalidFee(fee);
        if (isClaimed(index)) revert AlreadyClaimed();

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(index, account, amount));
        if (!MerkleProof.verify(merkleProof, merkleRoot, node)) revert InvalidProof();

        // Mark it claimed and send the token.
        _setClaimed(index);
        IERC20(token).safeTransfer(account, amount - fee);
        IERC20(token).safeTransfer(msg.sender, fee);

        emit Claimed(index, account, amount);
    }
}
