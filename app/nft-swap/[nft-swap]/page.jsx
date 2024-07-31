"use client";

import { useState, useEffect, useCallback } from "react";
import { getWalletAssets } from "@/lib/solana";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { proposeNFTSwap, getProposal, updateProposal } from "@/action";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";
import { ArrowUpDownIcon } from "lucide-react";

const NftTicket = dynamic(() => import("@/components/nftswap/NFTticket"), {
  ssr: false,
  loading: () => (
    <div className="w-[50px] h-[50px] rounded-lg animate-pulse bg-white/5" />
  ),
});

export default function NFTSwap() {
  const path = usePathname();
  const [nfts, setNfts] = useState([]);
  const wallet = useWallet();
  const [targetAddress, setTargetAddress] = useState("");
  const [nftToSwap, setNftToSwap] = useState([]);
  const [proposedNFT, setProposedNFT] = useState([]);
  const [proposalId, setProposalId] = useState("");
  const [isSender, setIsSender] = useState(false);

  const loadAssets = useCallback(async () => {
    if (wallet.publicKey != null && !nfts.length && !nftToSwap.length) {
      try {
        const proposal = await getProposal(path.split("/nft-swap/")[1]);
        let userNft
        if (proposal.userId1 != wallet.publicKey) {
          setIsSender(false)
          setProposedNFT(proposal.nft1);
          setTargetAddress(proposal.userId1);
          setNftToSwap(proposal.nft2);
          setProposalId(proposal._id);
          userNft = proposal.nft2
        }
        if (proposal.userId1 == wallet.publicKey) {
          setIsSender(true)
          setProposedNFT(proposal.nft2);
          setTargetAddress(proposal.userId2);
          setNftToSwap(proposal.nft1);
          setProposalId(proposal._id);
          userNft = proposal.nft1
        }

        //Fetch NFTs in connected wallet
        const assets = await getWalletAssets(wallet.publicKey);
        if (assets.length) {
          console.log(proposal.nft2);
          console.log(assets);

          const proposalRefer = userNft.reduce((acc, cur) => {
            acc.push(cur.id);
            return acc;
          }, []);
          console.log(proposalRefer);

          const assetsRefer = assets.reduce((acc, cur) => {
            if (proposalRefer.indexOf(cur.id) == -1) acc.push(cur);
            return acc;
          }, []);
          setNfts(assetsRefer);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [wallet]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const propose = () => {
    if (!nftToSwap || nftToSwap.length == 0) return;
    if(isSender) updateProposal(proposalId, wallet.publicKey, nftToSwap, targetAddress, proposedNFT, 0);
    else updateProposal(proposalId, targeAddress, proposedNFT, wallet.publicKey, nftToSwap, 1)
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

  const update = () => {

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
        <div className="flex flex-wrap min-h-[84px] w-full border hover:border-green rounded-lg gap-2 p-4">
          {nfts.map((nft, index) => {
            const imageURI = nft.image;
            const id = nft.id;
            return (
              <NftTicket
                src={imageURI}
                key={index}
                id={id}
                onClick={selectNFTToSwap}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <Label className="block mb-2">NFTs to swap</Label>
        <div className="flex flex-wrap min-h-[84px] w-full border hover:border-green gap-2 rounded-lg p-4">
          {nftToSwap.map((nft, index) => {
            const imageURI = nft.image;
            const id = nft.id;
            return (
              <NftTicket
                src={imageURI}
                key={index}
                id={id}
                onClick={selectNFTToCancel}
              />
            );
          })}
        </div>
      </div>
      <div className="flex justify-center items-center w-8 h-8 rounded-full bg-foreground scale-150 mx-auto">
        <ArrowUpDownIcon className="text-black" />
      </div>
      <div className="mb-8">
        <div className="flex flex-wrap min-h-[82px] w-full border hover:border-green gap-2 rounded-lg p-4">
          {proposedNFT.map((nft, index) => {
            const imageURI = nft.image;
            const id = nft.id;
            console.log(imageURI);
            return <NftTicket src={imageURI} key={index} id={id} />;
          })}
        </div>
      </div>
      <div className="my-8">
        <Label className="block mb-2">Target Address</Label>
        <div className="border hover:border-green h-10 rounded-lg p-2 truncate">
          {targetAddress}
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
