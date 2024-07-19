"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import NftTble from "@/components/NftTable";
import { useCallback, useState } from "react";
import { getAccountInformation, getAssetsByCreator, inputRouter } from "@/lib/solana";
import { MapPinIcon, SearchIcon } from "lucide-react";

export default function Snapshot() {
  const [inputValue, setInputValue] = useState("");
  const [nfts, setNfts] = useState([]);

  const handleChange = useCallback(
    (e) => {
      setInputValue(e.target.value);
    },
    [setInputValue]
  );

  const getList = async () => {
    const res = await inputRouter(inputValue);
    console.log(res)
    // if (NFTS.length) {
    //   console.log(NFTS);
    //   setNfts(NFTS);
    // } else {
    //   setNfts([]);
    // }
  };
  return (
    <div>
      <div className="flex gap-2 justify-center">
        <div className="grid w-full max-w-lg items-center gap-1.5">
          {/* <Label htmlFor="address"></Label> */}
          <Input
            id="address"
            type="text"
            placeholder="Input address here ..."
            value={inputValue}
            onChange={handleChange}
          />
        </div>
        <div>
          <Button onClick={getList}>
            <SearchIcon />
          </Button>
        </div>
      </div>
      <NftTble nfts={nfts} />
    </div>
  );
}
