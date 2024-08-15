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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useCallback } from "react";

import Spinner from "@/components/Assests/spinner/Spinner";
import { downloadObjectAsJson, downloadOwnersAsCsv } from "@/lib/utils";
import { useAlertContext } from "@/contexts/AlertContext";
import { SuccessAlert, ErrorAlert } from "@/lib/alerts";

export default function NFTSnapCard({
  nftOwners,
  setNftOwners,
  nfts,
  setNfts,
  isLoading,
  setIsLoading,
}) {
  const [inputValue, setInputValue] = useState("");
  const [isCombining, setIsCombining] = useState(false);
  const { alert, setAlert } = useAlertContext();

  /**
   * Get the list of NFT holders and can continuously combine with new collection holder list
   */
  const getHolderList = useCallback(async () => {
    setNfts([]);
    setIsLoading(true);
    try {
      const res = await inputRouter(inputValue, "holderlist");
      if (res.holderList) {
        setNftOwners(combineTwoHolderList(nftOwners, res.holderList));
        setIsCombining(true);
        setInputValue("");
      } else if (res.alert.visible) {
        setAlert(res.alert);
      } else {
        setAlert({ ErrorAlert, text: "Something went wrong" });
      }
    } catch (error) {
      console.log(error);
      setAlert({
        ...ErrorAlert,
        text: "Something went wrong",
      });
    }
    setIsLoading(false);
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
      setAlert({
        ...ErrorAlert,
        text: "Something went wrong",
      });
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
    <Card className="w-[900px] mx-auto mb-12 hover:border-green">
      <CardHeader>
        <CardTitle>NFT SNAPSHOT</CardTitle>
        <CardDescription>
          Input the address of NFT, collection or creator
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5 gap-2">
              <Label htmlFor="name">Address</Label>
              <Input
                id="name"
                placeholder="Address here"
                value={inputValue}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex justify-start gap-4">
          <Button
            onClick={() => {
              isCombining ? clearList() : getHasList();
            }}
          >
            {isLoading ? (
              <Spinner className="relative w-8 h-8" />
            ) : (
              `${isCombining ? "New" : "Hashlist"}`
            )}
          </Button>
          <Button onClick={getHolderList}>
            {isLoading ? (
              <Spinner className="relative w-8 h-8" />
            ) : (
              `${isCombining ? "Combine" : "Holderlist"}`
            )}
          </Button>
        </div>

        {nftOwners.length > 0 && (
          <div className="flex gap-4 items-center">
            Download
            {/* <Button onClick={downloadAsJson} className="hover:cursor-pointer">
              .json
            </Button> */}
            <Button onClick={downloadAsCsv} className="hover:cursor-pointer">
              .csv
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
