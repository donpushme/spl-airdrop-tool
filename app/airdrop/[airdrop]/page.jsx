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
import { loadList } from "@/action";

export default function Airdrop() {
  const path = usePathname();
  const [list, setList] = useState([]);
  const [amountPerEach, setAmountPerEach] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [price, setPrice] = useState(1);
  const [address, setAddress] = useState("");

  useEffect(() => {
    let fileName;
    let fileType;
    const start = async () => {
      const { data } = await loadList(fileName, fileType);
      const list = JSON.parse(Buffer.from(data.data).toString());
      console.log(list);
    };
    if (!path.includes('inputfile')) {
      console.log(path)
      fileName = path.slice(9).slice(0, 16);
      fileType = path[path.length - 1];
      start();
    }
  }, []);

  /**
   * Upload the file as soon as the user input the file(.json/.csv)
   * @param {event} event
   * @returns
   */
  const onChooseFile = async (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      let filetype = file.type;
      if (!filetype.match("json") && !filetype.match("csv")) return;
      filetype.match("json") ? (filetype = "json") : (filetype = "csv");
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
        const { success, message, fileName } = await finalizeUpload(
          uploadId,
          filetype
        );
        window.history.replaceState(
          {},
          "",
          `/airdrop/${fileName}${filetype[0]}`
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleAmountPerEachChange = (e) => {
    const value = e.target.value;
    if(isNaN(Number(value))) return;
    setAmountPerEach(Number(value));
    if(price) setTotalAmount(Number(value) * price);
  }

  const handleTotalAmountChange = (e) => {
    const value = e.target.value;
    if(isNaN(Number(value))) return;
    setTotalAmount(Number(value));
    if(price) setAmountPerEach(Number(value) / price);
  }

  return (
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
              <Input id="address" placeholder="Input the token address here"  value={address} onChange={(e) => setAddress(e.target.value)}/>
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Wallet list</Label>
              <Input id="wallet_list" type="file" onChange={onChooseFile} />
            </div>
            <div className="flex justify-between gap-2 flex-col md:flex-row">
              <div className="my-0">
                <Label htmlFor="amount_per_each">Amount per each wallet</Label>
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
              <Input id="address" placeholder="Input the token address here" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Collection</Label>
              <Input id="wallet_list" type="file" onChange={onChooseFile} />
            </div>
            <div className="flex justify-between gap-2 flex-col md:flex-row">
              <div className="my-0">
                <Label htmlFor="amount_per_each">Amount per each wallet</Label>
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
              <Input id="address" placeholder="Input the token address here" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Wallet list</Label>
              <Input id="wallet_list" type="file" onChange={onChooseFile} />
            </div>
            <div className="flex justify-between gap-2 flex-col md:flex-row">
              <div className="my-0">
                <Label htmlFor="amount_per_each">Amount per each wallet</Label>
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
          </CardContent>
          <CardFooter>
            <Button>Airdrop</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
