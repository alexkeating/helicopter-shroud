//    const accounts = await ethereum.request({
//            method: 'eth_requestAccounts'
//        });
//        const account = accounts[0];
//        const exampleMessage = 'I want to login into my stealth wallet on Ethereum mainnet.';
//        try {
//            const from = accounts[0];
//            const hexString = web3.utils.utf8ToHex(exampleMessage);
//            const msg = `0x${hexString.slice(2)}`;
//            const signature = await ethereum.request({
//                method: 'personal_sign',
//                params: [msg, from],
//            });
//            const sig1 = signature.slice(2, 66);
//            const sig2 = signature.slice(66, 130);
//            console.log(sig1);
//            console.log(sig2);
//            // Hash "v" and "r" values using SHA-256
//            const hashedV = ethers.utils.sha256("0x" + sig1);
//            const hashedR = ethers.utils.sha256("0x" + sig2);
//            const n = ethers.BigNumber.from('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
//            // Calculate the private keys by taking the hash values modulo the curve order
//            const privateKey1 = ethers.BigNumber.from(hashedV).mod(n);
//            const privateKey2 = ethers.BigNumber.from(hashedR).mod(n);
//            // Generate the key pairs
//            const keyPair1 = new ethers.Wallet(privateKey1.toHexString());
//            const keyPair2 = new ethers.Wallet(privateKey2.toHexString());
//            window.spendingPrivateKey = keyPair1.privateKey;
//            window.viewingPrivateKey = keyPair2.privateKey;
//            const spendingPublicKey = ethers.utils.computePublicKey(keyPair1.privateKey, true);
//            const viewingPublicKey = ethers.utils.computePublicKey(keyPair2.privateKey, true);
//            window.spendingPublicKey = spendingPublicKey;
//            window.viewingPublicKey = viewingPublicKey;
//            userStealthMetaAddressElement.innerHTML = `st:eth:${spendingPublicKey}${viewingPublicKey.slice(2,)}`;
//            interactionElements.classList.remove('d-none');
//            loginPage.classList.add('d-none');

// 1. split up meta address to viewing and spending
import { sha256, http, Chain, createWalletClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import {
  CURVE
} from '@noble/secp256k1';

export const generateKeys = (network: Chain, signature: string) => {
            const sig1 = signature.slice(2, 66);
            const sig2 = signature.slice(66, 130);
            console.log(sig1);
            console.log(sig2);
            const hashedV = sha256(("0x" + sig1) as `0x${string}`);
            const hashedR = sha256(("0x" + sig2) as `0x${string}`);
            const privateKey1 = BigInt(hashedV) % CURVE.n;
            const privateKey2 = BigInt(hashedR) % CURVE.n;
            const account1 = privateKeyToAccount(("0x" + privateKey1.toString()) as `0x${string}`)
            const client1 = createWalletClient({
              account: account1,
              chain: network,
              transport: http()
            })
            const account2 = privateKeyToAccount(("0x" + privateKey2.toString()) as `0x${string}`)
            const client2 = createWalletClient({
              account: account2,
              chain: network,
              transport: http()
            })
            // continue impl from https://github.com/paulmillr/noble-secp256k1/blob/main/index.js#L213


}
