"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { loadListbyChunks, uploadChunk, finalizeUpload, fetchUploadedFiles, fetchFile } from "@/action";
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
import Heading from "@/components/airdrop/Heading";
import { BackArrow, HelpIcon, NextArrow, RightArrow, RocketIcon, UploadIcon } from "@/components/Assests/icons/Icon";
import Link from "next/link";
import WalletToken from "@/components/airdrop/WalletTokens";
import { fetchWalletTokens, isValidSolanaAddress } from "@/lib/solana";
import { useWallet } from "@solana/wallet-adapter-react";
import UploadedFile from "@/components/airdrop/UploadedFile";
import Description from "@/components/airdrop/AirdropDescription";
import { useAlertContext } from "@/contexts/AlertContext";
import { SuccessAlert, ErrorAlert } from "@/lib/alerts";

export default function Airdrop() {
  const router = useRouter();
  const inputFile = useRef(null);
  const { setAlert } = useAlertContext()
  const path = usePathname();
  const wallet = useWallet();
  const { isSigned } = useAppContext();
  const { tempWallet, openWalletGenModal } = useModalContext();
  const [list, setList] = useState([]);
  const [fileId, setFileId] = useState("");
  const [amountPerEach, setAmountPerEach] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [address, setAddress] = useState("");
  const [collections, setCollections] = useState([]);
  const [counts, setCounts] = useState([]);
  const [totalCounts, setTotalCounts] = useState(0);
  const [multiplier, setMuliplier] = useState(1);
  const [countAirdrop, setCountAirdrop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletTokens, setWalletTokens] = useState([]);
  const [showWalletTokens, setShowWalletTokens] = useState(false);
  const [isExploring, setIsExploring] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState({});
  const [steps, setSteps] = useState([false, false, false])

  useEffect(() => {
    if (!isSigned) return;
    const {
      flag,
      fileId,
      address,
      counts,
      multiplier,
      totalAmount,
    } = getParams(path);
    if (flag == 0) {
      setAddress(address);
      setCounts(counts);
      setMuliplier(multiplier);
      setTotalAmount(totalAmount);
      setFileId(fileId);
      getList(fileId);
      getFile(fileId);
    }
  }, [isSigned, fileId]);

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

  const getList = async (fileId) => {
    if (fileId == "") return;
    setIsLoading(true);
    const data = await loadListbyChunks(fileId);
    const list = data;
    console.log(list)
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

  const getFile = async (fileId) => {
    console.log("auto loading fileId",fileId)
    const file = await fetchFile(fileId);
    console.log("auto loading file", file)
    setFile(file);
  }

  const getWalletTokens = useCallback(async () => {
    setShowWalletTokens(true);
    setIsExploring(true);
    const tokens = await fetchWalletTokens(wallet.publicKey);
    setWalletTokens(tokens);
    setIsExploring(false);
  }, [wallet, setShowWalletTokens]);


  const getUploadedFiles = useCallback(async () => {
    console.log(isSigned)
    if (!isSigned) {
      setAlert({ ...ErrorAlert, text: "Login first by connecting wallet" })
      return
    }
    setShowUpload(true);
    setIsExploring(true);
    const files = await fetchUploadedFiles();
    setUploadedFiles(files);
    setIsExploring(false);
  }, [isSigned])

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
      if (!fileType.match("csv")) return;
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
        console.log("Final upload")
        const { success, message, file } = await finalizeUpload(
          uploadId,
        );
        window.history.replaceState(
          {},
          "",
          makeURLwithFile(path, file._id)
        );
        setFileId(file._id);
        const type = file.type == 1 ? "single" : "combined";
        setFile(file);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const changeFile = (file) => {
    setFileId(file._id);
    window.history.replaceState(
      {},
      "",
      makeURLwithFile(path, file._id)
    );
    setFile(file);
  }

  const nextStep = useCallback(() => {
    if (steps[0] == false && (!isValidSolanaAddress(address) || fileId == "" || typeof fileId == "undefined")) {
      console.log("steps", steps)
      console.log(address, fileId)
      setAlert({ ...ErrorAlert, text: "Please input correct address and file" })
      return
    }
    const nextId = steps.indexOf(false);
    let temp = steps.with(nextId, true);
    setSteps(temp)
  }, [steps, address, fileId])

  const backStep = useCallback(() => {
    let nextId = steps.indexOf(false);
    if (nextId < 0) nextId = 3;
    let temp = steps.with(nextId - 1, false);
    setSteps(temp)
  }, [steps])

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
    if (isValidSolanaAddress(value) || value == "") {
      window.history.replaceState({}, "", makeURLwithAddress(path, value));
    }
  };

  const changeAddress = (address) => {
    setAddress(address);
    if (isValidSolanaAddress(address) || address == "") {
      window.history.replaceState({}, "", makeURLwithAddress(path, address));
    }
  }

  const generateWallet = () => {
    openWalletGenModal();
  };

  const handleAirdrop = () => {
    startTransferToken(list, tempWallet, address, setList);
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
      <div className="w-[900px] mx-auto">
        <Heading steps={steps} />
        <div>
          <div className="p-8 border rounded-xl">
            <div className="space-y-6">
              {/* Step 1 */}
              {!steps[0] && <div>
                <div className="my-4 relative">
                  <div className="flex gap-2">
                    <Label htmlFor="name">Token Address</Label>
                    <HelpIcon />
                  </div>
                  <div className="text-disabled text-xs italic mb-1">Connect your wallet to choose tokens directly from your wallet</div>
                  <div className="flex border rounded-md">
                    <Input
                      id="address"
                      placeholder="Select Tokens / Input token address"
                      className="placeholder-disabled p-4 border-0 w-[calc(100%-120px)]"
                      value={address}
                      onChange={handleAddressChange}
                    />
                    <button className="w-[120px] hover:cursor-pointer border-l text-xs bg-primary-foreground/50 rounded-r-md flex gap-2 items-center justify-center" disabled={!isSigned} onClick={getWalletTokens}>Explore Wallet<RightArrow /></button>
                  </div>
                  {showWalletTokens && <WalletToken tokens={walletTokens} setShowWalletTokens={setShowWalletTokens} isLoading={isExploring} setAddress={changeAddress} />}
                </div>
                <div className="my-4 relative">
                  <div className="flex gap-2">
                    <Label htmlFor="username">Import Wallet list</Label>
                    <HelpIcon />
                  </div>
                  <div className="text-disabled text-xs italic mb-1">Connect your wallet to get your previous snapshots or upload snapshot file</div>
                  <div className="flex border rounded-md">
                    <div className="p-4 border-0 w-[calc(100%-120px)] text-sm" onClick={getUploadedFiles}>{Object.keys(file).length != 0 ? `${file.token} ${file.type == 1 ? "(single)" : "(combined)"}` : "Choose from account"}</div>
                    <input
                      ref={inputFile}
                      id="wallet_list"
                      type="file"
                      className="hidden"
                      onChange={onChooseFile}
                    />
                    <button className="w-[120px] hover:cursor-pointer border-l text-xs bg-primary-foreground/50 rounded-r-md flex gap-2 items-center justify-center" disabled={!isSigned} onClick={() => {
                      console.log(inputFile.current)
                      inputFile.current.click();
                    }}>Upload File<UploadIcon /></button>
                  </div>
                  {showUpload && <UploadedFile files={uploadedFiles} setShowUpload={setShowUpload} isLoading={isExploring} changeFile={changeFile} />}
                </div>
              </div>}
              {/* Step 2 */}
              {steps[0] && !steps[1] && <div>
                <div>
                  <div className="space-y-1">
                    <Label htmlFor="amount_per_each">
                      Amount per {countAirdrop ? "NFT" : "wallet"}
                    </Label>
                    <Input
                      id="amount_per_each"
                      className="p-4"
                      type="text"
                      placeholder={`Input the amout of the tokens per ${file.isNft ? "NFT" : "wallet"}`}
                      value={amountPerEach}
                      onChange={handleAmountPerEachChange}
                    />
                  </div>
                  <div className="mt-4 space-y-1">
                    <Label htmlFor="totoal_amount">Total Amount</Label>
                    <Input
                      id="totoal_amount"
                      className="p-4"
                      type="text"
                      placeholder="Inpute the total amount to be distributed"
                      value={totalAmount}
                      onChange={handleTotalAmountChange}
                    />
                  </div>
                </div>
              </div>}
              <div className="space-y-1">
                <hr className="mb-8" />
                {!steps[0] && <div className="flex gap-1 items-center">
                  <Label>Dont't have snapshot list?</Label>
                  <Link href="/snapshot/ft" className="text-green text-sm">Click here</Link>
                </div>}
                {steps[0] == false ?
                  <Button className="flex border border-green p-4 w-full gap-1" onClick={nextStep}><RocketIcon />Get Started</Button>
                  : <div className="flex justify-between">
                    <Button className="px-8 flex gap-4" onClick={backStep}><BackArrow />Back</Button>
                    <Button className="px-8 flex gap-4" onClick={nextStep}>Next<NextArrow /></Button>
                  </div>
                }
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
            </div>
            <div>
              {tempWallet.length == 0 ? (
                <Button onClick={generateWallet}>
                  Generate temporay wallet
                </Button>
              ) : (
                <Button onClick={handleAirdrop}>Airdrop</Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {isLoading && <Loading />}
      {steps[0] == false ? <Description /> : <AirdropTable list={list} />}

    </div>
  );
}
