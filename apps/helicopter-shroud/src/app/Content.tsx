import { Button, Heading, Text } from '@chakra-ui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSignMessage } from 'wagmi'
import { prepareWriteContract, writeContract } from '@wagmi/core'
import { parseAbi } from 'viem';

import {Erc6538Registry} from "./../constants"


const STEALTH_REGISTRY_ABI = [
  "function registerKeys(uint256 schemeId, bytes calldata stealthMetaAddress)"
]

const Main = () => {
  const Msg = 'I want to login into my stealth wallet.'
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

  return (
    <div>
      <ConnectButton />
      <Heading as='h4' size='md'>Msg to sign:</Heading>
      <Text fontSize='md'>{Msg}</Text>
      <Button onClick={() => {signMessage()}}>Sign</Button>
    </div>
  )
}

export default Main
