// eslint-disable-next-line @typescript-eslint/no-unused-vars


import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { ChakraProvider } from '@chakra-ui/react'
import { goerli, optimismGoerli, mainnet, localhost } from 'wagmi/chains';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'


import Main from "./Content"


export const chainsConfig = [goerli];

const { chains, publicClient, webSocketPublicClient } = configureChains(chainsConfig, [
  alchemyProvider({ apiKey: "N-FhxXSm1VS-mvRdeMXsKQ4hC621rqMq" }),
  publicProvider(),
]);


const { connectors } = getDefaultWallets({
  appName: 'L2 Flexible Voting',
  projectId: String(import.meta.env.PUBLIC_WALLET_CONNECT_PROJECT_ID),
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
       <RainbowKitProvider
        chains={chains}
        theme={lightTheme({
          borderRadius: 'medium',
          overlayBlur: 'small',
        })}
      >
        <ChakraProvider>
          <Main />
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
