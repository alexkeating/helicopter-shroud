import {useEffect, useCallback, useState} from "react"
import { Button, Input, Heading, Textarea, Text } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, usePrepareContractWrite, useContractWrite, useContractRead, useNetwork, useSignMessage, useWalletClient } from 'wagmi'
import { readContracts, prepareWriteContract, writeContract } from '@wagmi/core'
import { parseAbi } from 'viem';

import {Erc6538Registry, Erc5564Announcer, MerkleDistributorDeployer} from "./../constants"
import {generateKeys, generateStealthAddress} from "./../lib/stealth-address-utils/generateStealthMetaAddress"
import AccountTree from "./../lib/merkle-distributor/accountTree"



const STEALTH_REGISTRY_ABI = [
  "function registerKeys(uint256 schemeId, bytes calldata stealthMetaAddress) external",
  "function stealthMetaAddressOf(address registrant, uint256 schemeId) external view returns (bytes)"
]

const MERKLE_DISTRIBUTOR_DEPLOYER = [
  "function deploy(address _token, bytes32 _merkleRoot) external returns (address)"
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
  // TODO THis may not be loaded
  const { data: walletClient } = useWalletClient()


  const { data, isError, isLoading, isSuccess, signMessage, error } = useSignMessage({ message: Msg, onSuccess: async (data) => {
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
  let [tokenAddress, setTokenAddress] = useState("")
  let [accountTree, setAccountTree] = useState()

  const generateMerkleTree = useCallback(async () => {

    console.log(claims)
    const claimObjects: Claim[] = JSON.parse(claims)
    const metaAddresses = await getRegisteredStealthMetaAddress(claimObjects)
    const stealthClaimObjects = []
    // TODO: we assume equal size for now
    for (const [i, claimObj] of claimObjects.entries()) {
      // 1. generate random number
      let amount = BigInt(claimObj.amount);
      while (amount > 0) {
        // 1. generate stealth address
        const x = generateStealthAddress(`st:eth:${metaAddresses[i].result}`)
        stealthClaimObjects.push({account: x.stealthAddress, amount: claimObj.amount})
        console.log("Stealth address")
        console.log(x)
        // 2. add to internal merkle list
        // TODO: claim announcement will happen after tree is built
        amount -= MAX_AMOUNT; // weird bigInt stuff probably
      }
    }
    setAccountTree(new AccountTree(stealthClaimObjects))
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
  /// Deploy distributor code
  //  The relayer will claim on your behalf using a
  //  signature for a fee.
  // register stealth keys
  const { data: prepareData, config: deployConfig } = usePrepareContractWrite({
    address: MerkleDistributorDeployer,
    abi: parseAbi(MERKLE_DISTRIBUTOR_DEPLOYER),
    functionName: 'deploy',
    args: [tokenAddress, accountTree ? accountTree.getHexRoot() : ""], // token address will be provided
     onSuccess(data) {
     }
  })
  const {data: deployData, isSuccess: deployIsSuccess, isLoading: deployIsLoading, write: deployWrite } = useContractWrite(deployConfig)
  useEffect(() => {
    if (!prepareData?.result || !deployIsSuccess) return
     const existingDistributors = window.localStorage.getItem("distributors")
      if (!existingDistributors) {
        window.localStorage.setItem("distributors", JSON.stringify([{address: prepareData.result}]))
        return
      }
      const existingDistributorsParsed = JSON.parse(existingDistributors)
      for (const distributor of existingDistributorsParsed) {
        if (distributor.address === prepareData.result) return
      }
      window.localStorage.setItem("distributors", JSON.stringify([{address: prepareData.result}, ...existingDistributorsParsed]))
  }, [prepareData, deployIsSuccess])
  console.log(deployData)
  console.log(prepareData)
  console.log(window.localStorage.getItem("distributors"))


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
        {accountTree &&
        (<><Heading as='h4' size='md'>Merkle Root</Heading>
        <Text fontSize='md'>
          {accountTree.getHexRoot()}
        </Text>
        <Heading as='h4' size='md'>Token Address</Heading>
        <Input onChange={(e) => {setTokenAddress(e.target.value)}}/>
        <Button onClick={deployWrite}>Deploy Distributor</Button>
        </>)
        }
      </>
      }

    </div>
  )
}

export default Main
