"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import NftTble from "@/components/NftTable";
import NftOwners from "@/components/FftOwners";
import { useCallback, useState, useEffect } from "react";
import { inputRouter, combineTwoHolderList } from "@/lib/solana";
import { MapPinIcon, Search, SearchIcon } from "lucide-react";
import Spinner from "@/components/Assests/spinner/Spinner";

export default function Snapshot() {
  const [inputValue, setInputValue] = useState("");
  const [nfts, setNfts] = useState([]);
  const [nftOwners, setNftOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCombining, setIsCombining] = useState(false);

  /**
   * Get the list of NFT holders and can continuously combine with new collection holder list
   */
  const getHolderList = useCallback(async () => {
    setNfts([]);
    setIsLoading(true);
    setIsCombining(true);
    try {
      const res = await inputRouter(inputValue, "holderlist");
      if (res.holderList) {
        setNftOwners(combineTwoHolderList(nftOwners, res.holderList));
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, [inputValue, nftOwners]);

  /**
   * Get the list of NFT
   */
  const getHasList = useCallback(async () => {
    setNftOwners([]);
    setIsLoading(true);
    try {
      const res = await inputRouter(inputValue, "hashlist");
      Array.isArray(res) && res.length ? setNfts(res) : setNfts([]);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, [inputValue, setNfts]);

  const handleChange = useCallback(
    (e) => {
      setInputValue(e.target.value);
    },
    [setInputValue]
  );

  const clearList = useCallback(() => {
    setNftOwners([]);
    setNfts([]);
    setIsCombining(false)
  }, [setNftOwners, setNfts, setIsCombining]);

  return (
    <div>
      <div className="flex gap-2 justify-center">
        <div className="grid w-full max-w-lg items-center gap-1.5">
          {/* <Label htmlFor="address"></Label> */}
          <Input
            id="address"
            type="text"
            className="border-green"
            placeholder="Input address here ..."
            value={inputValue}
            onChange={handleChange}
            onKeyPress={(e) => {
              if (e.key === "Enter") getList();
            }}
          />
        </div>
        <Button
          onClick={() => {
            isCombining ? clearList() : getHasList();
          }}
        >
          {isLoading ? (
            <Spinner className="relative w-8 h-8" />
          ) : (
            `${isCombining ? "new" : "hashlist"}`
          )}
        </Button>
        <Button onClick={getHolderList}>
          {isLoading ? (
            <Spinner className="relative w-8 h-8" />
          ) : (
            `${isCombining ? "combine" : "holderlist"}`
          )}
        </Button>
      </div>
      <NftTble nfts={nfts} />
      <NftOwners owners={nftOwners} />
    </div>
  );
}
