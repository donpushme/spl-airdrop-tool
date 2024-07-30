"use client";

import { useState, useEffect, useCallback } from "react";
import { getWalletAssets } from "@/lib/solana";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { proposeNFTSwap, getProposal } from "@/action";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import bs58 from "bs58";
import SwapListTable from "@/components/nftswap/SwapListTable"

const NftTicket = dynamic(() => import("@/components/nftswap/NFTticket"), {
  ssr: false,
  loading: () => (
    <div className="w-[50px] h-[50px] rounded-lg animate-pulse bg-white/5" />
  ),
});

export default function NFTSwap() {
  const wallet = useWallet();
  const [pending, setPending] = useState([])
  const [proposed, setProposed] = useState([])

  const loadAssets = useCallback(async () => {
    if (wallet.publicKey != null) {
      try {
        const proposal = await getProposal();
        setPending(proposal.pending);
        setProposed(proposal.proposed);
      } catch (error) {
        console.log(error);
      }
    }
  }, [wallet]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return (
    <div className="w-1/2 mx-auto">
      <div className="border rounded-lg">
        <SwapListTable list={pending}/>
      </div>

    </div>
  );
}
