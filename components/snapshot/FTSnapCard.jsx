"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useCallback, useEffect } from "react";
import { ftSnapshot, getTokenPrice } from "@/lib/ftSnapshot";
import { isValidSolanaAddress } from "@/lib/solana";
import { useAlertContext } from "@/contexts/AlertContext";
import { SuccessAlert, ErrorAlert } from "@/lib/alerts";
import { Switch } from "../ui/switch";
import { HelpIcon, UserListIcon } from "../Assests/icons/Icon";
import { useAppContext } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";

export default function FTSnapCard() {
  const router = useRouter();
  const { setAlert } = useAlertContext();
  const [thresholdType, setThresholdType] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [walletLimit, setWalletLimit] = useState("");
  const { mint, setMint, price, setPrice } = useAppContext();
  const [isLimit, setIsLimist] = useState(false);
  const [isPriceFetching, setIsPriceFetching] = useState(false);

  const walletLimtChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value)) setWalletLimit(value);
  };

  const getHolders = useCallback(() => {
    let path = `/snapshot/ft/`;
    if (!isValidSolanaAddress(mint)) {
      setAlert({ ...ErrorAlert, text: "Input valid token address" });
      return;
    }

    if (price == 0) {
      setAlert({ ...ErrorAlert, text: "The token has no price" });
      return;
    }

    path += `mint=${mint}`;
    if (thresholdType.length > 0 && thresholdType != "no") {
      let minThre = min == "" ? 0 : min;
      let maxThre = max == "" ? 0 : max;
      if (thresholdType == "price") {
        minThre = min / price;
        maxThre = max / price;
      }
      path += `min=${minThre}max=${maxThre}`;
    }

    if (isLimit) {
      if (walletLimit == "") {
        setAlert({ ...ErrorAlert, text: "Intput limit number of wallets" });
        return;
      }
      path += `limit=${walletLimit}`;
    }
    router.push(path);
  }, [
    mint,
    price,
    thresholdType,
    isLimit,
    router,
    setAlert,
    min,
    max,
    walletLimit,
  ]);

  const fetchPrice = useCallback(
    async (address) => {
      setIsPriceFetching(true);
      const tokenPrice = await getTokenPrice(address);
      console.log(tokenPrice);
      setIsPriceFetching(false);
      if (tokenPrice) setPrice(tokenPrice);
    },
    [setPrice]
  );

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (value.length >= 32 && value.length <= 44) fetchPrice(value);
      setMint(value);
    },
    [setMint, fetchPrice]
  );

  return (
    <div>
      <div className="w-[900px] mx-auto text-center">
        <div className="text-[50px]">Token Snapshot</div>
        <div>Take and export Token snapshot anywhere anytime</div>
      </div>
      <Card className="w-[900px] p-4 mx-auto mb-12">
        <CardContent>
          <div className="grid grid-cols-3 w-full items-center gap-4">
            <div className="col-span-2">
              <Label htmlFor="name" className="text-lg px-2 block mb-2">
                Address
              </Label>
              <Input
                className="p-4"
                id="name"
                placeholder="Enter token mint address"
                value={mint}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label
                htmlFor="framework"
                className="flex gap-2 items-center text-lg px-2 mb-2"
              >
                Threshold Type
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpIcon />
                    </TooltipTrigger>
                    <TooltipContent className="relative left-[40%] bottom-4 w-96">
                      <p>
                        Choose who should be included in the airdrop by setting a maximum, minimum or both, In terms of token balance or value.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Select
                onValueChange={(e) => {
                  setThresholdType(e);
                }}
              >
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="no">No threshold</SelectItem>
                  <SelectItem value="balance">Balance</SelectItem>
                  <SelectItem value="price">{`Value($)`}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            {thresholdType.length > 0 && thresholdType != "no" && (
              <div className="grid grid-cols-2 mt-4 justify-between items-center gap-4">
                <div>
                  <Label htmlFor="min" className="text-lg px-2 block mb-2">
                    Min
                  </Label>
                  <Input
                    className="p-4"
                    placeholder="Enter the min value"
                    name="min"
                    value={min}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!isNaN(value)) setMin(value);
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="max" className="text-lg px-2 block mb-2">
                    Max
                  </Label>
                  <Input
                    className="p-4"
                    name="max"
                    placeholder="Enter the max value"
                    value={max}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!isNaN(value)) setMax(value);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-12 gap-4">
          <div className="flex items-center gap-4 col-span-3">
            <Label htmlFor="wallet_limit">Wallet limit</Label>
            <div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpIcon />
                  </TooltipTrigger>
                  <TooltipContent className="relative left-[40%] bottom-4 w-96">
                    <p>
                      This will limit so you only get a list of the defined
                      amount of wallets. It will get the full list and choose a
                      random set of wallets until you get to the writen amount
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="wallet_limit"
              checked={isLimit}
              onCheckedChange={() => {
                setIsLimist((pre) => !pre);
              }}
            />
          </div>
          {isLimit ? (
            <Input
              className="h-[52px] col-span-5"
              placeholder="Enter the limit"
              value={walletLimit}
              onChange={walletLimtChange}
            />
          ) : (
            <div className="col-span-5"></div>
          )}
          <Button
            className="border border-green gap-2 col-span-4"
            onClick={getHolders}
            disabled={isPriceFetching}
          >
            <UserListIcon size={20} />
            Get Holders
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
