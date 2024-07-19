"use client";

import { AppContext } from "@/contexts/AppContext";
import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { AlertProvider } from "@/contexts/AlertContext";
import { AppProvider } from "@/contexts/AppContext";

export default function Providers({ children }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [network]
  );

  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <AppProvider>
            <AlertProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </AlertProvider>
          </AppProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
}
