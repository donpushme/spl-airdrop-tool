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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import react, { useState, useCallback, useEffect } from "react";
import { ftSnapshot, getTokenPrice } from "@/lib/ftSnapshot";
import Spinner from "@/components/Assests/spinner/Spinner";
import { downloadObjectAsJson, downloadOwnersAsCsv } from "@/lib/utils";

export function CardWithForm({ ftOwners, setFtOwners }) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thresholdType, setThresholdType] = useState("");
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [minLabel, setMinLabel] = useState("");
  const [maxLabel, setMaxLabel] = useState("");
  const [price, setPrice] = useState(0);

  /**
   * Get the list of NFT holders and can continuously combine with new collection holder list
   */
  const getHolderList = useCallback(async () => {
    if (price == 0 || inputValue.length > 44 || inputValue.length < 32) {
      return;
    }
    setIsLoading(true);
    let minThre = 0;
    let maxThre = 0;
    console.log(thresholdType);
    try {
      if (thresholdType == "price") {
        minThre = min / price;
        maxThre = max / price;
      } else {
        minThre = min;
        maxThre = max;
      }
      const res = await ftSnapshot(inputValue, minThre, maxThre);
      console.log(res);
      if (res.length) {
        setFtOwners(res);
        setIsLoading(false);
        setInputValue("");
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, [inputValue, min, max, thresholdType, price, setFtOwners, setIsLoading]);

  const fetchPrice = useCallback(
    async (address) => {
      const tokenPrice = await getTokenPrice(address);
      console.log(tokenPrice);
      if (tokenPrice) setPrice(tokenPrice);
    },
    [setPrice]
  );

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (value.length == 44) fetchPrice(value);
      setInputValue(value);
    },
    [setInputValue, fetchPrice]
  );

  const downloadAsJson = useCallback(() => {
    if (ftOwners.length > 0) downloadObjectAsJson(ftOwners, "holder_list");
  }, [ftOwners]);

  const downloadAsCsv = useCallback(() => {
    if (ftOwners.length > 0) downloadOwnersAsCsv(ftOwners, "holder_list");
  }, [ftOwners]);

  return (
    <Card className="w-[900px] mx-auto mb-12 hover:border-green">
      <CardHeader>
        <CardTitle>TOKEN SNAPSHOT</CardTitle>
        <CardDescription>
          Input the token mint address and threshold and click the button
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Address</Label>
              <Input
                className="hover:border-green"
                id="name"
                placeholder="Address here"
                value={inputValue}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Threshold Type</Label>
              <Select
                onValueChange={(e) => {
                  setThresholdType(e);
                }}
              >
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="balance">Balance</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {thresholdType.length > 0 && (
              <div className="flex justify-between items-center gap-4">
                Min:
                <Input
                  name="min"
                  value={min}
                  onChange={(e) => {
                    setMin(e.target.value);
                  }}
                ></Input>
                Max:
                <Input
                  name="max"
                  value={max}
                  onChange={(e) => {
                    setMax(e.target.value);
                  }}
                ></Input>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={getHolderList}>
          {isLoading ? <Spinner /> : "Get Holders"}
        </Button>

        {ftOwners.length > 0 && (
          <div className="flex gap-4 items-center">
            Download
            <Button onClick={downloadAsJson} className="hover:cursor-pointer">
              .json
            </Button>
            <Button onClick={downloadAsCsv} className="hover:cursor-pointer">
              .csv
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
