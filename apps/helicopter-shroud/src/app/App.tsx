// eslint-disable-next-line @typescript-eslint/no-unused-vars

import NxWelcome from './NxWelcome';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit';
import { goerli, optimismGoerli, mainnet } from 'wagmi/chains';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { alchemyProvider } from 'wagmi/providers/alchemy';


export const chainsConfig = [goerli, optimismGoerli, mainnet];

const { chains, publicClient, webSocketPublicClient } = configureChains(chainsConfig, [
  alchemyProvider({ apiKey: import.meta.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
  publicProvider(),
]);


const { connectors } = getDefaultWallets({
  appName: 'L2 Flexible Voting',
  projectId: String(import.meta.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID),
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
        <div>
          <NxWelcome title="helicopter-shroud" />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
