import MerkleTree from "./merkleTree";
import { utils, BigNumber } from "ethers";
import {
  bytesToHex,
  hexToBytes
} from 'viem/utils';



// This class was modified from the below file
//
// https://github.com/Uniswap/merkle-distributor/blob/c3255bfa2b684594ecd562cacd7664b0f18330bf/src/balance-tree.ts
export default class AccountTree {
  private readonly tree: MerkleTree;
  constructor(claims: {account: string; amount: number}[]) {
    this.tree = new MerkleTree(
      claims.map((claim, index) => {
        return AccountTree.toNode(index, claim.account, claim.amount);
      })
    );
  }

  public static verifyProof(
    index: number | BigNumber,
    account: string,
    amount: number,
    proof: Buffer[],
    root: Buffer
  ): boolean {
    let pair = AccountTree.toNode(index, account, amount);
    for (const item of proof) {
      pair = MerkleTree.combinedHash(pair, item);
    }

    return pair.equals(root);
  }

  // keccak256(abi.encode(index, account))
  public static toNode(index: number | BigNumber, account: string, amount: number) {
    console.log(index)
    console.log(amount)
    console.log(account)
    return hexToBytes(
      utils
        .solidityKeccak256(["uint256", "address", "uint256"], [index, account, amount]) as `0x${string}`
    );
  }

  public getHexRoot(): string {
    return this.tree.getHexRoot();
  }

  // returns the hex bytes32 values of the proof
  public getProof(index: number | BigNumber, account: string, amount: number): string[] {
    return this.tree.getHexProof(AccountTree.toNode(index, account, amount));
  }
}
