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
import { usePathname, useRouter, redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { loadListbyChunks, uploadChunk, finalizeUpload } from "@/action";
import AirdropTable from "@/components/airdrop/AirdropTable";
import { useModalContext } from "@/contexts/ModalContext";
import {
  simpleAirdrop,
  multiplierAirdrop,
  makeURLwithMultiplier,
  makeURLwithFile,
  makeURLwithAddress,
  makeURLwithAmount,
  removeCountsfromUrl,
  getParams,
} from "@/lib/utils";
import { startTransferToken } from "@/lib/airdrop";
import { useAppContext } from "@/contexts/AppContext";
import Loading from "@/components/Loading";

export default function Airdrop() {
  const router = useRouter();
  const { isSigned } = useAppContext();
  const path = usePathname();
  const { wallet, openWalletGenModal } = useModalContext();
  const [list, setList] = useState([]);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [amountPerEach, setAmountPerEach] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [address, setAddress] = useState("");
  const [collections, setCollections] = useState([]);
  const [counts, setCounts] = useState([]);
  const [totalCounts, setTotalCounts] = useState(0);
  const [multiplier, setMuliplier] = useState(1);
  const [countAirdrop, setCountAirdrop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isSigned) return;
    const {
      flag,
      fileName,
      fileType,
      address,
      counts,
      multiplier,
      totalAmount,
    } = getParams(path);
    if (flag == 0) {
      setFileName(fileName);
      setFileType(fileType);
      setAddress(address);
      setCounts(counts);
      setMuliplier(multiplier);
      setTotalAmount(totalAmount);
      getList(fileName, fileType);
    }
  }, [isSigned, fileName, fileType]);

  useEffect(() => {
    if (countAirdrop) {
      const { amountPerCount, resultList } = multiplierAirdrop(
        list,
        totalAmount,
        collections,
        counts,
        multiplier,
        setTotalCounts
      );
      setList(resultList);
      setAmountPerEach(amountPerCount || "");
      const url = makeURLwithMultiplier(path, counts, multiplier, totalAmount);
      window.history.replaceState({}, "", url);
    } else {
      const resultList = simpleAirdrop(list, totalAmount);
      setList(resultList);
      setTotalCounts(list.length);
      const url = makeURLwithAmount(path, totalAmount);
      window.history.replaceState({}, "", url);
    }
  }, [counts, multiplier, countAirdrop, totalAmount]);

  const getList = async (fileName, fileType) => {
    if (fileName == "" || fileType == "") return;
    setIsLoading(true);
    const data = await loadListbyChunks(fileName, fileType);
    const list = data;
    if (list.length) {
      if (!Object.keys(list[0]).includes("balance")) {
        const properties = Object.keys(list[0]).slice(1);
        setCollections(properties);
        setCountAirdrop(true);
      } else {
        window.history.replaceState({}, "", removeCountsfromUrl(path));
      }
      setList(list);
      setIsLoading(false);
    }
  };

  const clear = () => {
    setList([]);
    setAmountPerEach("");
    window.history.replaceState({}, "", removeCountsfromUrl(path));
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
          makeURLwithFile(path, fileName, fileType)
        );
        setFileName(fileName);
        setFileType(fileType);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleAmountPerEachChange = (e) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    setAmountPerEach(value || "");
    if (totalCounts) setTotalAmount(Number(value) * totalCounts || "");
  };

  const handleTotalAmountChange = (e) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    setTotalAmount(value || "");
    if (totalCounts) setAmountPerEach(Number(value) / totalCounts || "");
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    if (value.length <= 44 && value.length > 32) {
      window.history.replaceState({}, "", makeURLwithAddress(path, value));
    }
  };

  const generateWallet = () => {
    openWalletGenModal();
  };

  const handleAirdrop = () => {
    startTransferToken(list, wallet, address, setList);
  };

  const handleCountChange = (e, index) => {
    const value = e.target.value;
    setCounts((prevCounts) => {
      const newCounts = [...prevCounts];
      newCounts[index] = value;
      return newCounts;
    });
  };

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
            <CardContent className="space-y-6">
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
                <Label htmlFor="username">
                  Wallet list{!isSigned && " (Connect wallet first)"}
                </Label>
                {list.length > 0 ? (
                  <Button className="block" onClick={clear}>
                    New
                  </Button>
                ) : (
                  <Input
                    id="wallet_list"
                    type="file"
                    onChange={onChooseFile}
                    disabled={!isSigned}
                  />
                )}
              </div>
              {collections.length > 0 ? (
                <>
                  <hr />
                  <div className="space-y-1">
                    <Label>Set Multiplier</Label>
                    <div className="flex gap-1 justify-start">
                      {collections.map((item, index) => {
                        return (
                          <div key={index} className="flex gap-1">
                            {index != 0 && <div className="pt-8">+</div>}
                            <div className="my-0">
                              <Label
                                htmlFor={`${item}_count`}
                                className="text-xs font-light"
                              >
                                {item}
                              </Label>
                              <Input
                                className="max-w-[100px]"
                                id={`${item}_count`}
                                type="text"
                                value={counts[index] || ""}
                                onChange={(e) => {
                                  handleCountChange(e, index);
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="my-0">
                      <Label htmlFor="muliplier" className="text-xs font-light">
                        Multiplier
                      </Label>
                      <Input
                        id="muliplier"
                        value={multiplier}
                        onChange={(e) => {
                          setMuliplier(e.target.value);
                        }}
                        type="text"
                        className="max-w-[100px]"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <></>
              )}
              <hr />
              <div className="flex justify-between gap-2 flex-col md:flex-row">
                <div className="space-y-1">
                  <Label htmlFor="amount_per_each">
                    Amount per {countAirdrop ? "count" : "wallet"}
                  </Label>
                  <Input
                    id="amount_per_each"
                    type="text"
                    value={amountPerEach}
                    onChange={handleAmountPerEachChange}
                  />
                </div>
                <div className="space-y-1">
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
      {isLoading && <Loading />}
      <AirdropTable list={list} />
    </div>
  );
}
