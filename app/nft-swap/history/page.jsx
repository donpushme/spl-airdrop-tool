"use client";

import { useState, useEffect, useCallback } from "react";
import { proposeNFTSwap, getProposal } from "@/action";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import HistoryTable from "@/components/nftswap/HistoryTable";
import { useAppContext } from "@/contexts/AppContext";

export default function NFTSwap() {
  const wallet = useWallet();
  const [completed, setCompleted] = useState([]);
  const {isSigned} = useAppContext()

  const loadAssets = useCallback(async () => {
    if (wallet.publicKey != null) {
      try {
        const proposal = await getProposal();
        setCompleted(proposal.completed);
        console.log(proposal)
      } catch (error) {
        console.log(error);
      }
    }
  }, [wallet]);

  useEffect(() => {
    if(!isSigned) return
    loadAssets();
  }, [loadAssets, isSigned]);

  return (
    <div className="w-1/2 mx-auto">
      {completed.length > 0 && (
        <div className="border rounded-lg">
          <HistoryTable list={completed} />
        </div>
      )}
    </div>
  );
}
