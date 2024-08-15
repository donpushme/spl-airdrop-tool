"use client";

import { Input } from "@/components/ui/input";
import NftTble from "@/components/snapshot/NftTable";
import NftOwners from "@/components/snapshot/NftOwners";
import NFTSnapCard from "@/components/snapshot/NFTSnapCard";
import { useState } from "react";
import { inputRouter, combineTwoHolderList } from "@/lib/nftSnapshot";
import Loading from "@/components/Loading";

export default function Snapshot() {
  const [inputValue, setInputValue] = useState("");
  const [nfts, setNfts] = useState([]);
  const [nftOwners, setNftOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  return (
    <div className="w-full">
      <NFTSnapCard nftOwners={nftOwners} nfts={nfts} setNfts={setNfts} setNftOwners={setNftOwners} isLoading={isLoading} setIsLoading={setIsLoading}/>
      {isLoading && <Loading/>}
      <NftTble nfts={nfts} />
      <NftOwners owners={nftOwners} />
    </div>
  );
}
