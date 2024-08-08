"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { getAccountInformation, getMetadata } from "@/lib/nftSnapshot";
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { getCoreMetadata } from "@/lib/coreSnapshot";
import Link from "next/link";
import { Copy, Check } from "lucide-react";

const NFTCard = (props) => {
  const { className } = props || "";
  const { nft, onClick } = props;
  const [copied, setCopied] = useState(false);

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(nft.id);
      setCopied(true);
    } catch (error) {
      console.log(error);
    }
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div
      className={`${className} bg-gradient-to-r from-[rgb(10,10,10)] to-[rgb(22,22,22)] p-2 rounded border hover:border-green`}
    >
      <div className={`relative aspect-square w-[100px] h-[100px]`}>
        <Image
          loader={() => nft.image}
          src="me.png"
          fill
          alt=""
          className="rounded hover:cursor-pointer"
          id={nft.id}
          onClick={onClick}
        />
      </div>
      <div className="w-[100px] h-[50px] mt-1 text-[12px] font-light">
        <p className="text-center truncate">{`${nft.name}`}</p>
        <div className="flex gap-1">
          <Link
            className="block relative"
            href={`https://solscan.io/account/${nft.id}`}
            target="_blank"
          >
            <Image src="/solscan.png" height={15} width={15} alt="" />
          </Link>
          <p className="block w-[60px] truncate">{nft.id}</p>
          {!copied ? (
            <Copy
              size={15}
              className="hover:cursor-pointer"
              onClick={copyContent}
            />
          ) : (
            <Check size={15} />
          )}
        </div>
        <Link
          className="relative flex gap-1"
          href={`https://magiceden.io/item-details/${nft.id}`}
          target="_black"
        >
          <div className="relative aspect-square w-[15px] h-[15px]">
            <Image className="rounded-full" src="/magiceden.png" fill alt="" />
          </div>
          Magiceden
        </Link>
      </div>
    </div>
  );
};

export default NFTCard;
