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
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadListbyChunks, airdrop, uploadChunk, finalizeUpload } from "@/action";
import { getTokenPrice } from "@/lib/ftSnapshot";
import AirdropTable from "@/components/airdrop/AirdropTable";
import { useModalContext } from "@/contexts/ModalContext";

export default function Airdrop() {
  const path = usePathname();
  const { openWalletGenModal } = useModalContext();
  const { wallet, setWallet } = useModalContext();
  const [list, setList] = useState([]);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [amountPerEach, setAmountPerEach] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [price, setPrice] = useState(null);
  const [address, setAddress] = useState("");

  useEffect(() => {
    let fileName;
    let fileType;
    if (path.length == 26 || path.length >= 58) {
      fileName = path.slice(9, 25);
      setFileName(fileName);
      fileType = path.slice(25, 26);
      fileType == "c" ? (fileType = "csv") : (fileType = "json");
      setFileType(fileType);
      if (path.length > 26) setAddress(path.slice(26));
      getList(fileName, fileType);
    } else if (path.length <= 58 && path.length > 26) {
      const tokenMint = path.slice(9, 53);
      setAddress(tokenMint);
    }
  }, []);

  const getList = async (fileName, fileType) => {
    const data = await loadListbyChunks(fileName, fileType);
    const list = data;
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
        await uploadChunk(chunk, uploadId, chunkIndex);
        start += chunkSize;
        chunkIndex++;
      }

      // Finalize the upload
      try {
        const { success, message, fileName } = await finalizeUpload(
          uploadId,
          fileType
        );
        window.history.replaceState(
          {},
          "",
          `/airdrop/${fileName}${fileType[0]}${address}`
        );
        setFileName(fileName)
        setFileType(fileType)
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
    if (value.length < 44 && value.length > 32) {
      getPrice(value);
      const path = fileName.length
        ? `/airdrop/${fileName}${fileType[0]}${value}`
        : `/airdrop/${value}`;
      window.history.replaceState({}, "", path);
    } else {
      setPrice(null);
      const path = fileName.length
        ? `/airdrop/${fileName}${fileType[0]}`
        : `/airdrop/inputfile`;
      window.history.replaceState({}, "", path);
    }
  };

  const generateWallet = () => {
    openWalletGenModal();
  };

  const handleAirdrop =  () => {
    const response = airdrop(fileName, fileType, address, wallet, {amountPerEach, totalAmount})
  }

  return (
    <div>
      <div defaultValue="default" className="w-[900px]">
        <div value="default">
          <Card>
            <CardHeader>
              <CardTitle>Airdrop</CardTitle>
              <CardDescription>
                You can airdrop your token to the list of wallet account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Token Address</Label>
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
              {wallet.length == 0 ? (
                <Button onClick={generateWallet}>
                  Generate temporay wallet
                </Button>
              ) : (
                <Button onClick={handleAirdrop}>Airdrop</Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      <AirdropTable list={list} />
    </div>
  );
}
