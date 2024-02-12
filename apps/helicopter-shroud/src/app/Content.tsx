import { Button, Heading, Text } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractRead, useNetwork, useSignMessage } from 'wagmi'
import { prepareWriteContract, writeContract } from '@wagmi/core'
import { parseAbi } from 'viem';

import {Erc6538Registry, Erc5564Announcer} from "./../constants"
import {generateKeys} from "./../lib/stealth-address-utils/generateStealthMetaAddress"


const STEALTH_REGISTRY_ABI = [
  "function registerKeys(uint256 schemeId, bytes calldata stealthMetaAddress) external",
  "function stealthMetaAddressOf(address registrant, uint256 schemeId) external view returns (bytes)"
]

const Main = () => {
  const Msg = 'I want to login into my stealth wallet.'
  const { address } = useAccount()
  const { chain } = useNetwork()

  const { data, isError, isLoading, isSuccess, signMessage, error } = useSignMessage({
    message: Msg,
    onSuccess: async (data) => {
      console.log(data);
      console.log(Erc6538Registry);
      // register stealth keys

      // This should happen after registration
      // const config = await prepareWriteContract({
      //    address: Erc6538Registry,
      //    abi: parseAbi(STEALTH_REGISTRY_ABI),
      //    functionName: 'registerKeys',
      //    args: [1, data],
      //  })
      //  console.log(config)
      //  const { hash } = await writeContract(config)
      //  console.log(hash)
    }
  })

  // This shouldn't exist yet
  // read if meta address exists
  //const { data: stealthMetaAddress, isError: stealthAddressIsError, isLoading: stealthMetaAddressIsLoading, error: errorL } = useContractRead({
  // address: Erc6538Registry,
  // abi: parseAbi(STEALTH_REGISTRY_ABI),
  // functionName: 'stealthMetaAddressOf',
  // args: [address, 1]
  //})
  const keys = generateKeys(data);
  console.log(keys)

  // Next functionality
  // 1. Build merkle claim tree
  // 2. Emit an announcement without a proof
  //    - view tag should be a 1 byte has of a key
  //    - metadata will only have amount
  //    - Once announcements are emitted we will parse and claim using a relayer

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
      </Text></>
      }

    </div>
  )
}

export default Main
