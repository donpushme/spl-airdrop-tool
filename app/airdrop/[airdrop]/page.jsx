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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadChunk, finalizeUpload } from "@/action";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadListbyChunks } from "@/action";
import { getTokenPrice } from "@/lib/ftSnapshot";
import FTOwnerTable from "@/components/airdrop/FTOwberTable";

export default function Airdrop() {
  const path = usePathname();
  const [list, setList] = useState([]);
  const [amountPerEach, setAmountPerEach] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [price, setPrice] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    let fileName;
    let fileType;
    if (!path.includes("inputfile")) {
      console.log(path);
      fileName = path.slice(9).slice(0, 16);
      fileType = path[path.length - 1];
      fileType == "c" ? (fileType = "csv") : (fileType = "json");
      getList(fileName, fileType);
    }
  }, []);

  const getList = async (fileName, fileType) => {
    const data = await loadListbyChunks(fileName, fileType);
    const list = data
    if (list.length) setList(list);
  };

  /**
   * Upload the file as soon as the user input the file(.json/.csv)
   * @param {event} event
   * @returns
   */
  const onChooseFile = async (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      let fileType = file.type;
      if (!fileType.match("json") && !fileType.match("csv")) return;
      fileType.match("json") ? (fileType = "json") : (fileType = "csv");
      const chunkSize = 1024 * 1024; // 1MB chunks
      const uploadId = Date.now().toString(); // Unique identifier for the upload session

      let start = 0;
      let chunkIndex = 0;
      while (start < file.size) {
        const chunk = file.slice(start, start + chunkSize);
        console.log(chunk);
        console.log(file);
        await uploadChunk(chunk, uploadId, chunkIndex);
        start += chunkSize;
        chunkIndex++;
      }

      // Finalize the upload
      try {
        const { success, message, fileName } = await finalizeUpload( uploadId, fileType );
        window.history.replaceState(
          {},
          "",
          `/airdrop/${fileName}${fileType[0]}`
        );
        getList(fileName, fileType);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleAmountPerEachChange = (e) => {
    const value = e.target.value;
    const length = list.length;
    if (isNaN(Number(value))) return;
    setAmountPerEach(Number(value));
    if (price) setTotalAmount(Number(value) * length);
  };

  const handleTotalAmountChange = (e) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    setTotalAmount(Number(value));
    if (price) setAmountPerEach(Number(value) / length);
  };

  const getPrice = async (address) => {
    try {
      const res = await getTokenPrice(address);
      console.log(res);
      if (res) setPrice(res);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    if (value.length == 44) {
      getPrice(value);
    }
  };

  return (
    <div>
      <Tabs defaultValue="default" className="w-[900px]">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="default">To list of holders</TabsTrigger>
          <TabsTrigger value="singe_collection">
            For single NFT collection
          </TabsTrigger>
          <TabsTrigger value="combined_collection">
            For multi-NFT collection
          </TabsTrigger>
        </TabsList>
        <TabsContent value="default">
          <Card>
            <CardHeader>
              <CardTitle>Simple airdrop</CardTitle>
              <CardDescription>
                You can airdrop your token to the list of wallet account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">You token address</Label>
                <Input
                  id="address"
                  placeholder="Input the token address here"
                  value={address}
                  onChange={handleAddressChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Wallet list</Label>
                {list.length > 0 ? (
                  <Button
                    className="block"
                    onClick={() => {
                      setList([]);
                    }}
                  >
                    New
                  </Button>
                ) : (
                  <Input id="wallet_list" type="file" onChange={onChooseFile} />
                )}
              </div>
              {price && (
                <div className="flex justify-between gap-2 flex-col md:flex-row">
                  <div className="my-0">
                    <Label htmlFor="amount_per_each">
                      Amount per each wallet
                    </Label>
                    <Input
                      id="amount_per_each"
                      type="text"
                      value={amountPerEach}
                      onChange={handleAmountPerEachChange}
                    />
                  </div>
                  <div className="my-0">
                    <Label htmlFor="totoal_amount">Total Amount</Label>
                    <Input
                      id="totoal_amount"
                      type="text"
                      value={totalAmount}
                      onChange={handleTotalAmountChange}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button>Airdrop</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="singe_collection">
          <Card>
            <CardHeader>
              <CardTitle>Airdrop to Collection</CardTitle>
              <CardDescription>
                You can airdrop your token to the list of wallet account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">You token address</Label>
                <Input
                  id="address"
                  placeholder="Input the token address here"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Collection</Label>
                {list.length > 0 ? (
                  <Button
                    className="block"
                    onClick={() => {
                      setList([]);
                    }}
                  >
                    New
                  </Button>
                ) : (
                  <Input id="wallet_list" type="file" onChange={onChooseFile} />
                )}
              </div>
              {price && (
                <div className="flex justify-between gap-2 flex-col md:flex-row">
                  <div className="my-0">
                    <Label htmlFor="amount_per_each">
                      Amount per each wallet
                    </Label>
                    <Input
                      id="amount_per_each"
                      type="text"
                      value={amountPerEach}
                      onChange={handleAmountPerEachChange}
                    />
                  </div>
                  <div className="my-0">
                    <Label htmlFor="totoal_amount">Total Amount</Label>
                    <Input
                      id="totoal_amount"
                      type="text"
                      value={totalAmount}
                      onChange={handleTotalAmountChange}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button>Airdrop</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="combined_collection">
          <Card>
            <CardHeader>
              <CardTitle>Muli-airdrop</CardTitle>
              <CardDescription>
                You can airdrop your token to the list of wallet account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">You token address</Label>
                <Input
                  id="address"
                  placeholder="Input the token address here"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Wallet list</Label>
                {list.length > 0 ? (
                  <Button
                    className="block"
                    onClick={() => {
                      setList([]);
                    }}
                  >
                    New
                  </Button>
                ) : (
                  <Input id="wallet_list" type="file" onChange={onChooseFile} />
                )}
              </div>
              {price && (
                <div className="flex justify-between gap-2 flex-col md:flex-row">
                  <div className="my-0">
                    <Label htmlFor="amount_per_each">
                      Amount per each wallet
                    </Label>
                    <Input
                      id="amount_per_each"
                      type="text"
                      value={amountPerEach}
                      onChange={handleAmountPerEachChange}
                    />
                  </div>
                  <div className="my-0">
                    <Label htmlFor="totoal_amount">Total Amount</Label>
                    <Input
                      id="totoal_amount"
                      type="text"
                      value={totalAmount}
                      onChange={handleTotalAmountChange}
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button>Airdrop</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <FTOwnerTable list={list}/>
    </div>
  );
}
