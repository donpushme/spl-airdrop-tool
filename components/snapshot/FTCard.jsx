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
import react, { useState, useCallback } from "react";
import { ftSnapshot } from "@/lib/ftSnapshot";
import Spinner from "@/components/Assests/spinner/Spinner";
import { downloadObjectAsJson, downloadOwnersAsCsv } from "@/lib/utils";

export function CardWithForm({ ftOwners, setFtOwners }) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [thresholdType, setThresholdType] = useState("")
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);

  /**
   * Get the list of NFT holders and can continuously combine with new collection holder list
   */
  const getHolderList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ftSnapshot(inputValue);
      console.log(res);
      if (res.length) {
        setFtOwners(res);
        setIsLoading(false);
        setInputValue("");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, [inputValue, setFtOwners, setIsLoading]);

  const handleChange = useCallback(
    (e) => {
      setInputValue(e.target.value);
    },
    [setInputValue]
  );

  const downloadAsJson = useCallback(() => {
    if (ftOwners.length > 0) downloadObjectAsJson(ftOwners, "holder_list");
  }, [ftOwners]);

  const downloadAsCsv = useCallback(() => {
    if (ftOwners.length > 0) downloadOwnersAsCsv(ftOwners, "holder_list");
  }, [ftOwners]);

  return (
    <Card className="w-[700px] mx-auto mb-12">
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
                className="border-green"
                id="name"
                placeholder="Address here"
                value={inputValue}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Threshold Type</Label>
              <Select>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="balance" onClick={(e)=>{setThresholdType(e.target.value)}}>Balance</SelectItem>
                  <SelectItem value="price" onClick={(e)=>{setThresholdType(e.target.value)}}>Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between items-center gap-4">
              Min:<Input></Input>
              Max:<Input></Input>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={getHolderList}>
          {isLoading ? <Spinner/> : "Get Holders"}
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
