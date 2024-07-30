"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import NftTble from "@/components/snapshot/NftTable";
import NftOwners from "@/components/snapshot/NftOwners";
import { useCallback, useState, useEffect } from "react";
import { inputRouter, combineTwoHolderList } from "@/lib/nftSnapshot";
import Spinner from "@/components/Assests/spinner/Spinner";
import {
  downloadObjectAsJson,
  downloadNftAsCsv,
  downloadOwnersAsCsv,
} from "@/lib/utils";

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
      console.log(res);
      if (res.holderList) {
        setNftOwners(combineTwoHolderList(nftOwners, res.holderList));
        setIsLoading(false);
        setInputValue("");
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
      setInputValue("");
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
    setIsCombining(false);
  }, [setNftOwners, setNfts, setIsCombining]);

  const downloadAsJson = useCallback(() => {
    if (nfts.length > 0) downloadObjectAsJson(nfts, "hash_list");
    if (nftOwners.length > 0) downloadObjectAsJson(nftOwners, "holder_list");
  }, [nfts, nftOwners]);

  const downloadAsCsv = useCallback(() => {
    if (nfts.length > 0) downloadNftAsCsv(nfts, "hash_list");
    if (nftOwners.length > 0) downloadOwnersAsCsv(nftOwners, "holder_list");
  }, [nfts, nftOwners]);

  return (
    <div className="w-full">
      <div className="flex gap-2 justify-center items-end">
        <div className="grid w-full max-w-lg items-center gap-1.5">
          {/* <Label htmlFor="address"></Label> */}
          <Input
            id="address"
            type="text"
            className="hover:border-green"
            placeholder="Input address here ..."
            value={inputValue}
            onChange={handleChange}
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
        {(nftOwners.length > 0 || nfts.length > 0) && (
          <Button
            onClick={downloadAsJson}
            className="hover:cursor-pointer h-4 px-4 py-1"
          >
            .json
          </Button>
        )}
        {(nftOwners.length > 0 || nfts.length > 0) && (
          <Button
            onClick={downloadAsCsv}
            className="hover:cursor-pointer h-4 px-4 py-1"
          >
            .csv
          </Button>
        )}
      </div>
      <NftTble nfts={nfts} />
      <NftOwners owners={nftOwners} />
    </div>
  );
}
