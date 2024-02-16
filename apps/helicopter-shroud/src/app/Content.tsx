import {useCallback, useState} from "react"
import { Button, Heading, Textarea, Text } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, usePrepareContractWrite, useContractWrite, useContractRead, useNetwork, useSignMessage } from 'wagmi'
import { readContracts, prepareWriteContract, writeContract } from '@wagmi/core'
import { parseAbi } from 'viem';

import {Erc6538Registry, Erc5564Announcer} from "./../constants"
import {generateKeys, generateStealthAddress} from "./../lib/stealth-address-utils/generateStealthMetaAddress"


const STEALTH_REGISTRY_ABI = [
  "function registerKeys(uint256 schemeId, bytes calldata stealthMetaAddress) external",
  "function stealthMetaAddressOf(address registrant, uint256 schemeId) external view returns (bytes)"
]

type Claim = {
  address: string;
  amount: number;
}

const MAX_AMOUNT = BigInt(100e18);
const Main = () => {
  const Msg = 'I want to login into my stealth wallet.'
  const { address } = useAccount()
  const { chain } = useNetwork()

  const { data, isError, isLoading, isSuccess, signMessage, error } = useSignMessage({
    message: Msg,
    onSuccess: async (data) => {
      console.log(data);
      console.log(Erc6538Registry);
    }
  })
  const keys = generateKeys(data);
  console.log(keys)

  // register stealth keys
  const { config } = usePrepareContractWrite({
    address: Erc6538Registry,
    abi: parseAbi(STEALTH_REGISTRY_ABI),
    functionName: 'registerKeys',
    args: [1, `${keys?.spendingPublicKey}${keys?.viewingPublicKey.slice(2,)}`],

  })
  const { isLoading: registerIsLoading, write: registerWrite } = useContractWrite(config)
  /// Claim state start

  // Claim will be a array with amounts listed in json format
  let [claims, setClaims] = useState("")
  const generateMerkleTree = useCallback(async () => {

        console.log(claims)
    const claimObjects: Claim[] = JSON.parse(claims)
    const metaAddresses = await getRegisteredStealthMetaAddress(claimObjects)
    // TODO: we assume equal size for now
    for (const [i, claimObj] of claimObjects.entries()) {
      // 1. generate random number
      let amount = BigInt(claimObj.amount);
      while (amount > 0) {
        // 1. generate stealth address
        const x = generateStealthAddress(`st:eth:${metaAddresses[i].result}`)
        console.log("Stealth address")
        console.log(x)
        // 2. add to internal merkle list
        // TODO: claim announcement will happen after tree is built
        amount -= MAX_AMOUNT; // weird bigInt stuff probably
      }
    }

  }, [claims])

  const getRegisteredStealthMetaAddress = async (claims: Claim[]) => {
    // Get registered address
    console.log(claims)
    const calls = []
    for (const claim of claims) {
    calls.push({
      address: Erc6538Registry,
      abi: parseAbi(STEALTH_REGISTRY_ABI),
      functionName: 'stealthMetaAddressOf',
      args: [claim.address, 1]
    })
    }
    const data = await readContracts({contracts: calls})
    console.log("Here")
    console.log(data)
    return data
  }
  /// Claim state end

  // This shouldn't exist yet
  // read if meta address exists
  //const { data: stealthMetaAddress, isError: stealthAddressIsError, isLoading: stealthMetaAddressIsLoading, error: errorL } = useContractRead({
  // address: Erc6538Registry,
  // abi: parseAbi(STEALTH_REGISTRY_ABI),
  // functionName: 'stealthMetaAddressOf',
  // args: [address, 1]
  //})

  // Next functionality
  // 1. Build merkle claim tree
  // 2. Emit an announcement without a proof
  //    - view tag should be a 1 byte has of a key
  //    - metadata will only have amount
  //    - Once announcements are emitted we will parse and claim using a relayer

  // TODO: Add textarea validation
  //  - invalid addresses should be removed
  return (
    <div>
      <ConnectButton />
      { !keys?.spendingPublicKey ? (
      <>
        <Heading as='h4' size='md'>Msg to sign:</Heading>
        <Text fontSize='md'>{Msg}</Text>
        <Button onClick={() => {signMessage()}}>Sign</Button>
        </>
        ) : <><Heading as='h4' size='md'>Stealth meta address</Heading>
        <Text fontSize='md'>
          {`st:eth:${keys?.spendingPublicKey}${keys?.viewingPublicKey.slice(2,)}` as string}
        </Text>
        <Button isLoading={registerIsLoading} onClick={registerWrite}>Register meta address</Button>
        <Heading as='h4' size='md'>Create airdrop</Heading>
        <Textarea value={claims} onChange={(e) => {setClaims(e.target.value)}}placeholder="Comma delimited list of addresses" />
        <Button type="submit" onClick={generateMerkleTree}>Submit</Button>
      </>
      }

    </div>
  )
}

export default Main
