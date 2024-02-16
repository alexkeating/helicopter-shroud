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
import { hexToBytes } from 'viem';
import {
  keccak256,
  bytesToHex,
  hexToBytes,
} from 'viem/utils';

import {
  CURVE,
  getPublicKey,
  etc,
  ProjectivePoint,
  utils,
  getSharedSecret
} from '@noble/secp256k1';

export const generateKeys = (signature: string) => {
            if (!signature || !signature.length) {
              return null
            }
            // https://github.com/nerolation/stealth-wallet/blob/92e3448dcbaf7d94ca7463afa8ecd0f44dc74e2f/scripts/website_logic.js#L254
            const sig1 = signature.slice(2, 66);
            const sig2 = signature.slice(66, 130);
            console.log(sig1);
            console.log(sig2);
            const hashedV = sha256(("0x" + sig1) as `0x${string}`); // hashedV
            const hashedR = sha256(("0x" + sig2) as `0x${string}`);
            // Probably some cryptography issue here
            const privateKey1 = `0x${(BigInt(hashedV) % CURVE.n).toString(16)}`;
            const privateKey2 = `0x${(BigInt(hashedR) % CURVE.n).toString(16)}`;
            //const spendingPrivateKey = etc.hashToPrivateKey(`0x` + sig1)
            //const viewingPrivateKey = toPriv(privateKey2)
            console.log("keys")
            console.log(privateKey1)
            console.log(privateKey2)
            const spendingPublicKey = getPublicKey(privateKey1.slice(2), true)
            const viewingPublicKey = getPublicKey(privateKey2.slice(2), true)
            return {
              spendingPrivateKey: privateKey1,
              spendingPublicKey: `0x${etc.bytesToHex(spendingPublicKey)}`,
              viewingPrivateKey: privateKey2,
              viewingPublicKey: `0x${etc.bytesToHex(viewingPublicKey)}`
            }
}


function randomPrivateKey() {
  const randPrivateKey = utils.randomPrivateKey();
  return BigInt(`${bytesToHex(randPrivateKey)}`);
}

function toEthAddress(PublicKey: `0x${string}`) {
  var stAA = keccak256(hexToBytes(PublicKey));
  return "0x"+stAA.slice(-40);
}


export const generateStealthAddress = (stealthMetaAddress: string) => {
// https://github.com/nerolation/stealth-utils/blob/main/generateStealthAddress.js#L18
  // 1. Get stealth meta address
  // 2. Generate stealth address from stealth metaaddress
  const USER = stealthMetaAddress;
  if (!USER.startsWith("st:eth:0x")){
    throw "Wrong address format; Address must start with `st:eth:0x...`";
  }

  const R_pubkey_spend = ProjectivePoint.fromHex(USER.slice(9,75));
  console.log('R_pubkey_spend:', R_pubkey_spend);
  console.log('USER', USER);

  const R_pubkey_view = ProjectivePoint.fromHex(USER.slice(75,));
  const ephemeralPrivateKey = randomPrivateKey();
  const ephemeralPublicKey = getPublicKey(ephemeralPrivateKey, true);
  console.log('USER', ephemeralPrivateKey.toString(16));
  console.log('USER', R_pubkey_view.toHex());
  const sharedSecret = getSharedSecret(ephemeralPrivateKey.toString(16), R_pubkey_view.toHex());
  // console.log('View tag:', bytesToHex(sharedSecret));
  const hashedSharedSecret = keccak256(sharedSecret);
  const ViewTag = `0x${hashedSharedSecret.toString().substring(2, 4)}`;
  // console.log('View tag:', ViewTag);
  // console.log('View tag:', hashedSharedSecret);
  const hashedSharedSecretPoint = ProjectivePoint.fromPrivateKey(hexToBytes(hashedSharedSecret));
  //console.log('hashedSharedSecretPoint1:', hashedSharedSecretPoint);
  const stealthPublicKey = R_pubkey_spend.add(hashedSharedSecretPoint);
  // console.log('View tag:', stealthPublicKey.toHex());
  const stealthAddress = toEthAddress(`0x${stealthPublicKey.toHex()}`);
  return {"stealthAddress":stealthAddress, "ephemeralPublicKey": bytesToHex(ephemeralPublicKey), "ViewTag":ViewTag};
}
