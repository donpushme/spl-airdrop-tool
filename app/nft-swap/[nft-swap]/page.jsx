"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getWalletAssets, swapNFT } from "@/lib/solana";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  getProposal,
  updateProposal,
  updateConfirm,
  getConfirm,
  deleteProposal,
} from "@/action";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";
import { ArrowUpDownIcon } from "lucide-react";
import { io } from "socket.io-client";
import { API_URL } from "@/config";
import { useRouter } from "next/navigation";

const NftTicket = dynamic(() => import("@/components/nftswap/NFTticket"), {
  ssr: false,
  loading: () => (
    <div className="w-[50px] h-[50px] rounded-lg animate-pulse bg-white/5" />
  ),
});

export default function NFTSwap() {
  const path = usePathname();
  const router = useRouter();
  const [nfts, setNfts] = useState([]);
  const wallet = useWallet();
  const [targetAddress, setTargetAddress] = useState("");
  const [nftToSwap, setNftToSwap] = useState([]);
  const [proposedNFT, setProposedNFT] = useState([]);
  const [proposalId, setProposalId] = useState("");
  const [isSender, setIsSender] = useState(false);
  const [confirm, setConfirm] = useState([false, false]);
  const socket = useMemo(() => io(API_URL), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadConfirm = async () => {
    const newConfirm = await getConfirm(proposalId);
    setConfirm(newConfirm);
  };

  const loadAssets = useCallback(async () => {
    if (wallet.publicKey != null) {
      try {
        const proposal = await getProposal(path.split("/nft-swap/")[1]);
        let userNft;
        if (proposal.userId1 != wallet.publicKey) {
          setIsSender(false);
          setProposedNFT(proposal.nft1);
          setTargetAddress(proposal.userId1);
          setNftToSwap(proposal.nft2);
          userNft = proposal.nft2;
        }
        if (proposal.userId1 == wallet.publicKey) {
          setIsSender(true);
          setProposedNFT(proposal.nft2);
          setTargetAddress(proposal.userId2);
          setNftToSwap(proposal.nft1);
          userNft = proposal.nft1;
        }
        setProposalId(proposal._id);
        setConfirm([proposal.confirm1, proposal.confirm2]);

        //Fetch NFTs in connected wallet
        const assets = await getWalletAssets(wallet.publicKey);
        if (assets.length) {
          const proposalRefer = userNft.map((nft) => nft.id);
          const assetsRefer = assets.filter(
            (asset) => !proposalRefer.includes(asset.id)
          );
          setNfts(assetsRefer);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [wallet.publicKey, path]);

  useEffect(() => {
    // Set up socket listeners once when component mounts
    socket.on("updateProposal", () => {
      loadAssets(); // Call the function to load assets
    });

    socket.on("swap", async () => {
      swap();
    });

    socket.on("updateConfirm", () => {
      loadConfirm(); // Call the function to load confirmation status
    });

    // Clean up the socket listeners on component unmount
    return () => {
      socket.off("swap");
      socket.off("updateProposal");
      socket.off("updateConfirm");
    };
  }, [socket, loadAssets, loadConfirm]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const update = () => {
    if (!nftToSwap || nftToSwap.length == 0) return;
    if (isSender)
      updateProposal(
        proposalId,
        wallet.publicKey,
        nftToSwap,
        targetAddress,
        proposedNFT,
        [true, confirm[1]]
      );
    else
      updateProposal(
        proposalId,
        targetAddress,
        proposedNFT,
        wallet.publicKey,
        nftToSwap,
        [confirm[0], true]
      );
    socket.emit("updateProposal");
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
    confirmChange();
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
    confirmChange();
  };

  const confirmChange = () => {
    if (isSender) {
      setConfirm((pre) => {
        updateConfirm(proposalId, [false, pre[1]]);
        return [false, pre[1]];
      });
    } else {
      setConfirm((pre) => {
        updateConfirm(proposalId, [pre[0], false]);
        return [pre[0], false];
      });
    }
    socket.emit("updateConfirm");
  };

  const swap = async () => {
    await swapNFT(wallet, nftToSwap, targetAddress);
    if(isSender) await deleteProposal(proposalId)
    router.push("/nft-swap");
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
      <div className="flex justify-center items-center w-8 h-8 rounded-full bg-foreground/20 scale-150 mx-auto">
        <ArrowUpDownIcon className="text-background" />
      </div>
      <div className="mb-8">
        <div className="flex flex-wrap min-h-[82px] w-full border hover:border-green gap-2 rounded-lg p-4">
          {proposedNFT.map((nft, index) => {
            const imageURI = nft.image;
            const id = nft.id;
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
      <div className="my-8 flex">
        {confirm[0] && confirm[1] ? (
          <Button onClick={swap}>Swap</Button>
        ) : (
          <Button
            className="border hover:border-green"
            onClick={update}
            disabled={isSender ? confirm[0] : confirm[1]}
          >
            {(isSender && confirm[0]) || (!isSender && confirm[1])
              ? "Wait for other"
              : "Update and Confirm"}
          </Button>
        )}
      </div>
    </div>
  );
}
