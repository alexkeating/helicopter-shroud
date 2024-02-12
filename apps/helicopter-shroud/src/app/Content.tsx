import { Button, Heading, Text } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractRead, useNetwork, useSignMessage } from 'wagmi'
import { prepareWriteContract, writeContract } from '@wagmi/core'
import { parseAbi } from 'viem';

import {Erc6538Registry, Erc5564Announcer} from "./../constants"


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

      const config = await prepareWriteContract({
         address: Erc6538Registry,
         abi: parseAbi(STEALTH_REGISTRY_ABI),
         functionName: 'registerKeys',
         args: [1, data],
       })
       console.log(config)
       const { hash } = await writeContract(config)
       console.log(hash)
    }
  })

  // read if meta address exists
  const { data: stealthMetaAddress, isError: stealthAddressIsError, isLoading: stealthMetaAddressIsLoading, error: errorL } = useContractRead({
   address: Erc6538Registry,
   abi: parseAbi(STEALTH_REGISTRY_ABI),
   functionName: 'stealthMetaAddressOf',
   args: [address, 1]
  })
  console.log(stealthMetaAddress)
  console.log(stealthAddressIsError)
  console.log(errorL)
  console.log(stealthMetaAddressIsLoading)

  return (
    <div>
      <ConnectButton />
      { !stealthMetaAddress && !stealthMetaAddressIsLoading ? (
        <>
      <Heading as='h4' size='md'>Msg to sign:</Heading>
      <Text fontSize='md'>{Msg}</Text>
      <Button onClick={() => {signMessage()}}>Sign</Button>
      </>
      ) : <><Heading as='h4' size='md'>Stealth meta address</Heading>
      <Text fontSize='md'>
        {stealthMetaAddress as string}
      </Text></>
      }

    </div>
  )
}

export default Main
