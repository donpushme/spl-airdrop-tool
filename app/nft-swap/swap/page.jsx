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

const NFTCard = dynamic(() => import("@/components/nftswap/NFTCard"), {
  ssr: false,
  loading: () => (
    <div className="w-[50px] h-[50px] rounded-lg animate-pulse bg-white/5" />
  ),
});

export default function NFTSwap() {
  const [nfts, setNfts] = useState([]);
  const wallet = useWallet();
  const [targetAddress, setTargetAddress] = useState("");
  const [nftToSwap, setNftToSwap] = useState([]);

  const loadAssets = useCallback(async () => {
    if (wallet.publicKey != null && !nfts.length && !nftToSwap.length) {
      try {
        const proposal = await getProposal();
        console.log(proposal);
      } catch (error) {
        console.log(error);
      }
      try {
        const assets = await getWalletAssets(wallet.publicKey);
        if (assets.length) setNfts(assets);
      } catch (error) {
        console.log(error);
      }
    }
  }, [wallet]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const propose = () => {
    if (
      !targetAddress ||
      targetAddress.length != 44 ||
      targetAddress == wallet.publicKey
    )
      return;
    if (!nftToSwap || nftToSwap.length == 0) return;
    proposeNFTSwap(targetAddress, nftToSwap);
  };

  const selectNFTToSwap = (e) => {
    const id = e.target.id;
    const image = e.target["data-loaded-src"];
    setNftToSwap((pre) => [...pre, { id, image }]);
    const assets = nfts.reduce((acc, cur) => {
      if (cur.id != id) acc.push(cur);
      return acc;
    }, []);
    setNfts(assets);
  };

  const selectNFTToCancel = (e) => {
    const id = e.target.id;
    const image = e.target["data-loaded-src"];
    setNfts((pre) => [...pre, { id, image }]);
    const assets = nftToSwap.reduce((acc, cur) => {
      if (cur.id != id) acc.push(cur);
      return acc;
    }, []);
    setNftToSwap(assets);
  };
  return (
    <div className="w-1/2">
      <div>
        <h1 className="text-lg">NFT SWAP</h1>
        <h3>You can directly exchange your NFT with others here.</h3>
        <h3>
          {" "}
          - First select your NFT you want to send and input the address who
          will receive them.
        </h3>
        <h3>
          {" "}
          - Confirm the NFTs and address click Propose button and wait until the
          receiver gets the propose and responds
        </h3>
        <h3> - Click Swap button after you receive the response</h3>
      </div>
      <div className="my-8">
        <Label className="block mb-2">Your NFTs</Label>
        <div className="flex flex-wrap w-full border hover:border-green rounded-lg gap-2 p-4">
          {nfts.map((nft, index) => {
            const imageURI = nft.image;
            const id = nft.id;
            return <NFTCard key={index} nft={nft} onClick={selectNFTToSwap} />;
          })}
        </div>
      </div>
      <div className="my-8">
        <Label className="block mb-2">Target Address</Label>
        <Input
          className="border hover:border-green"
          value={targetAddress}
          onChange={(e) => {
            setTargetAddress(e.target.value);
          }}
        />
      </div>
      <div className="my-8">
        <Label className="block mb-2">NFTs to swap</Label>
        <div className="flex flex-wrap w-full border hover:border-green gap-2 rounded-lg p-4">
          {nftToSwap.map((nft, index) => {
            return (
              <NFTCard
                nft={nft}
                key={index}
                onClick={selectNFTToCancel}
              />
            );
          })}
        </div>
      </div>
      <div className="my-8">
        <Button className="border hover:border-green" onClick={propose}>
          Propose
        </Button>
      </div>
    </div>
  );
}
