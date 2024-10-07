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
  getTotalCountForSimple,
  getTotalCountForFt,
  ftAridrop
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { FEE_PER_TRANSFER } from "@/backend/src/config";
import { useToken } from "@/hooks/useToken";
import CopyButton from "@/components/airdrop/CopyButton";
import Spinner from "@/components/Assests/spinner/Spinner";
import Spinner_1 from "@/components/Assests/spinner/Spinner_1";
import Image from "next/image";
import { downloadAirdropResult } from "@/lib/utils";

export default function Airdrop() {
  const router = useRouter();
  const inputFile = useRef(null);
  const { setAlert } = useAlertContext()
  const path = usePathname();
  const wallet = useWallet();
  const { isSigned, mint, setMint, canStartAirdrop } = useAppContext();
  const { tempWallet, openWalletGenModal, totalAmount, setTotalAmount, fee, setFee } = useModalContext();
  const [list, setList] = useState([]);
  const [fileId, setFileId] = useState("");
  const [amountPerEach, setAmountPerEach] = useState("");
  const [collections, setCollections] = useState([]);
  const [counts, setCounts] = useState([[]]);
  const [totalCounts, setTotalCounts] = useState(0);
  const [multiplier, setMuliplier] = useState([1]);
  const [countAirdrop, setCountAirdrop] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletTokens, setWalletTokens] = useState([]);
  const [showWalletTokens, setShowWalletTokens] = useState(false);
  const [isExploring, setIsExploring] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState({});
  const [steps, setSteps] = useState([false, false, false]);
  const [showMultiplier, setShowMultiplier] = useState(false);
  const [ruleLen, setRuleLen] = useState(1);
  const [forceRender, setForceRender] = useState(true);
  const { token } = useToken();
  const [isAirdropStarted, setIsAirdropStarted] = useState(false)
  const [balanceAirdrop, setBalanceAirdrop] = useState(false);
  const [stack, setStack] = useState(false);

  useEffect(() => {
    if (!isSigned) return;
    const {
      flag,
      fileId,
      address,
      counts,
      multiplier,
      totalAmount,
      ruleLen,
    } = getParams(path);
    if (flag == 0) {
      setMint(address);
      setCounts(counts);
      setMuliplier(multiplier);
      setTotalAmount(totalAmount);
      setFileId(fileId);
      getFile(fileId);
      getList(fileId);
      setRuleLen(ruleLen)
    }
  }, [isSigned, fileId]);

  useEffect(() => {
    if (canStartAirdrop) {
      handleAirdrop()
    }
  }, [canStartAirdrop])

  useEffect(() => {
    if (countAirdrop && showMultiplier) {
      const { amountPerCount, resultList } = multiplierAirdrop(
        list,
        totalAmount,
        collections,
        counts,
        multiplier,
        setTotalCounts,
        stack
      );
      console.log("multiplier airdrop", { totalCounts })
      setList(resultList);
      setAmountPerEach(amountPerCount || "");
      const url = makeURLwithMultiplier(path, counts, multiplier, totalAmount);
      window.history.replaceState({}, "", url);
    } else if (countAirdrop) {
      const totalCounts = getTotalCountForSimple(list, collections);
      console.log("simpleAirdrop", { totalCounts })
      setTotalCounts(totalCounts)
      const resultList = simpleAirdrop(list, totalAmount, totalCounts, collections);
      setList(resultList);
      const url = makeURLwithAmount(path, totalAmount);
      window.history.replaceState({}, "", url);
    } else {
      const totalCounts = getTotalCountForFt(list, balanceAirdrop);
      console.log("Fungible token airdrop", { totalCounts })
      setTotalCounts(totalCounts)
      const resultList = ftAridrop(list, totalAmount, totalCounts, balanceAirdrop);
      setList(resultList);
    }
  }, [counts, multiplier, countAirdrop, forceRender, totalAmount, balanceAirdrop, stack]);

  const getList = async (fileId) => {
    if (fileId == "") return;
    setIsLoading(true);
    const data = await loadListbyChunks(fileId);
    const list = data;
    if (list && list.length > 0) {
      let properties = [];
      if (!Object.keys(list[0]).includes("balance")) {
        properties = Object.keys(list[0]).slice(1);
        setCollections(properties);
      }
      const totalCounts = getTotalCountForSimple(list, properties);
      setTotalCounts(totalCounts)
      setList(list);
      setFee(list.length * FEE_PER_TRANSFER)
      setIsLoading(false);
    }
  };

  const download = useCallback(() => {
    if (list.length > 0) downloadAirdropResult(list, "airdrop_result");
  }, [list, token])

  const switchMultiplierMode = () => {
    if (showMultiplier) {
      setMuliplier([1]);
      setCounts([[]]);
    }
    setShowMultiplier(pre => !pre)
  }

  const switchBalanceMode = () => {
    setBalanceAirdrop(!balanceAirdrop)
  }

  const clear = () => {
    setList([]);
    // setAmountPerEach("");
    // setTotalAmount("");
    setCollections([]);
    // setCounts([[]]);
    window.history.replaceState({}, "", removeCountsfromUrl(path));
  };

  const getFile = async (fileId) => {
    const file = await fetchFile(fileId);
    if (file.isNft) {
      setCountAirdrop(true);
    } else {
      window.history.replaceState({}, "", removeCountsfromUrl(path));
    }
    setFile(file);
  }

  const addNewRule = () => {
    console.log("ruleLen", ruleLen, "counts", counts, "multiplier", multiplier);
    setRuleLen(pre => pre + 1);
    setCounts(pre => {
      return [...pre, []]
    });
    setMuliplier(pre => {
      return [...pre, 1];
    });
    setForceRender(!forceRender);
    console.log(counts.length, "counts length")
  }

  const removeRule = () => {
    console.log("ruleLen", ruleLen, "counts", counts, "multiplier", multiplier)
    setRuleLen(pre => pre - 1);
    setCounts(pre => {
      return pre.slice(0, pre.length - 1)
    });
    setMuliplier(pre => {
      return pre.slice(0, pre.length - 1)
    });
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
    console.log(files)
    setIsExploring(false);
    setForceRender(!forceRender)
  }, [isSigned])

  /**
   * Upload the file as soon as the user input the file(.json/.csv)
   * @param {event} event
   * @returns
   */
  const onChooseFile = async (event) => {
    clear();
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
    if (steps[0] == false && (!isValidSolanaAddress(mint) || fileId == "" || typeof fileId == "undefined")) {
      console.log("steps", steps)
      console.log(mint, fileId)
      setAlert({ ...ErrorAlert, text: "Please input correct address and file" })
      return
    }
    const nextId = steps.indexOf(false);
    let temp = steps.with(nextId, true);
    setSteps(temp)
  }, [steps, mint, fileId])

  const backStep = useCallback(() => {
    let nextId = steps.indexOf(false);
    if (nextId < 0) nextId = 3;
    let temp = steps.with(nextId - 1, false);
    setSteps(temp)
  }, [steps])

  const handleAmountPerEachChange = useCallback((e) => {
    console.log({ totalCounts })
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    setAmountPerEach(value || "");
    if (totalCounts) setTotalAmount(Number(value) * totalCounts || "");
  }, [totalCounts, setAmountPerEach, setTotalAmount])

  const handleTotalAmountChange = useCallback((e) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    setTotalAmount(value || "");
    if (totalCounts) setAmountPerEach(Number(value) / totalCounts || "");
  }, [totalCounts, setAmountPerEach, setTotalAmount])

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setMint(value);
    if (isValidSolanaAddress(value) || value == "") {
      window.history.replaceState({}, "", makeURLwithAddress(path, value));
    }
  };

  const changeAddress = (mint) => {
    setMint(mint);
    if (isValidSolanaAddress(mint) || mint == "") {
      window.history.replaceState({}, "", makeURLwithAddress(path, mint));
    }
  }

  const generateWallet = () => {
    openWalletGenModal();
  };

  const handleAirdrop = async () => {
    setIsAirdropStarted(true);
    await startTransferToken(list, tempWallet, token, setList);
    setIsAirdropStarted(false);
  };

  const handleCountChange = useCallback((e, index, ruleNum) => {
    console.log(counts)
    const value = e.target.value;
    setCounts((prevCounts) => {
      const newCounts = [...prevCounts];
      newCounts[ruleNum][index] = value;
      return newCounts;
    });
  }, [counts, setCounts, forceRender, setForceRender])

  const handleMultiplierChanged = useCallback((e, ruleNum) => {
    console.log(multiplier)
    setMuliplier((multipliers) => {
      multipliers[ruleNum] = e.target.value;
      return multipliers;
    });
    setForceRender(!forceRender);
  }, [multiplier, setMuliplier, forceRender, setForceRender])

  return (
    <div>
      <div className="w-[900px] mx-auto">
        <Heading steps={steps} />
        <div>

          {!canStartAirdrop && <div className="p-8 border rounded-xl">
            <div className="space-y-6">
              {typeof token?.name != 'undefined' &&
                <div className="flex justify-between gap-2 border-b pb-2">
                  <div className="flex gap-2">
                    <div className="relative aspect-square w-10 rounded-full">
                      <Image className="rounded-full" loader={() => token?.image} src='me.png' fill alt="token image" />
                    </div>
                    <div>
                      <div>{token?.name}</div>
                      <div className="flex gap-2 text-xs">{token?.address}<CopyButton value={token?.address} /></div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {`${token?.symbol}`}
                  </div>
                </div>}
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
                      value={mint}
                      onChange={handleAddressChange}
                    />
                    <button className="w-[120px] hover:cursor-pointer border-l text-xs bg-primary-foreground/50 rounded-r-md flex gap-2 items-center justify-center" disabled={!isSigned} onClick={getWalletTokens}>Explore Wallet<RightArrow /></button>
                  </div>
                  {showWalletTokens && <WalletToken tokens={walletTokens} setShowWalletTokens={setShowWalletTokens} isLoading={isExploring} setMint={changeAddress} />}
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
                  {!showMultiplier && !balanceAirdrop && <div className="space-y-1">
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
                  </div>}
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
                {!countAirdrop && <div className="my-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Label>Airdrop according To Balance</Label>
                    <Switch
                      id="set_balance_mode"
                      value={balanceAirdrop}
                      onCheckedChange={switchBalanceMode}
                    />
                  </div>
                </div>}
                {countAirdrop && <div className="my-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Label>Set Multiplier</Label>
                    <Switch
                      id="show_multiplier"
                      checked={showMultiplier}
                      onCheckedChange={switchMultiplierMode}
                    />
                    {showMultiplier && <div className="flex items-center gap-4">
                      <Label>Stack</Label>
                      <Checkbox id="stack" onClick={() => { setStack((pre) => !pre) }} />
                    </div>}
                  </div>
                  {showMultiplier && <div className="flex gap-2">
                    <button className="border p-2 rounded hover:bg-primary/20 text-sm" onClick={addNewRule}>New Rule</button>
                    {ruleLen > 1 && <button className="border p-2 rounded hover:bg-primary/20" onClick={removeRule}>Remove Rule</button>}
                  </div>}
                </div>}

                {showMultiplier && (
                  <>
                    <hr />
                    {new Array(ruleLen).fill(1).map((rule, ruleNum) => {
                      return (
                        <div className="flex justify-between" key={ruleNum}>
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
                                      className="max-w-[200px]"
                                      id={`${item}_count`}
                                      type="text"
                                      value={counts[ruleNum][index] || ""}
                                      onChange={(e) => {
                                        handleCountChange(e, index, ruleNum);
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="ml-1">
                            <Label htmlFor="muliplier" className="text-xs font-light">
                              Multiplier
                            </Label>
                            <Input
                              id="muliplier"
                              className="max-w-[200px]"
                              value={multiplier[ruleNum]}
                              onChange={(e) => { handleMultiplierChanged(e, ruleNum) }}
                              type="text"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>}
              {/* Step 3 */}
              {steps[1] && !steps[2] && <div>
                <div className="flex border-b p-4 justify-between"><div>Tokens Per NFT</div><div>{amountPerEach}</div></div>
                <div className="flex border-b p-4 justify-between"><div>Number of Wallets</div><div>{list?.length}</div></div>
                <div className="flex border-b p-4 justify-between"><div>Total tokens needed</div><div>{totalAmount}</div></div>
                <div className="flex border-b p-4 justify-between"><div>Estimated Cost</div><div></div>{fee} SOL</div>
              </div>}
              {/* Button section */}
              <div className="space-y-1">
                <hr className="mb-8" />
                {!steps[0] && <div className="flex gap-1 items-center">
                  <Label>Do not have the snapshot list?</Label>
                  <Link href="/snapshot/ft" className="text-green text-sm">Click here</Link>
                </div>}
                {steps[0] == false ?
                  <Button className="flex border border-green p-4 w-full gap-1" onClick={nextStep}><RocketIcon />Get Started</Button>
                  : <div className="flex justify-between">
                    <Button className="px-8 flex gap-4" onClick={backStep}><BackArrow />Back</Button>
                    {steps[1] == true ? <Button className="gap-4 flex" onClick={generateWallet}>
                      Generate temporay wallet<NextArrow />
                    </Button> : <Button className="px-8 flex gap-4" onClick={nextStep}>Next<NextArrow />
                    </Button>}
                  </div>
                }
              </div>
            </div>
          </div>}
          {canStartAirdrop &&
            <div className="my-10 px-8">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <div className="relative aspect-square w-10 rounded-full">
                    {/* Image Component */}
                    <img
                      className="rounded-full"
                      src={token?.image}
                      alt="token image"
                      fill
                    />
                  </div>
                  <div>
                    <div>{token?.name}</div>
                    <div className="flex gap-2 text-xs">
                      {token?.address}
                    </div>
                  </div>
                </div>
                <div className="flex items-center py-2 px-4 bg-primary-foreground rounded-full">{totalAmount}</div>
              </div>
              <div>
                {isAirdropStarted ? <Spinner_1 /> : <div className="flex justify-center my-8">
                  <div>
                    <div className="text-center">Airdrop has completed successfully!</div>
                    <div className="flex justify-center mt-4 gap-4">
                      <Button className="border" onClick={() => { router.push("/airdrop/inputfile") }}>New Airdrop</Button>
                      <Button className="border" onClick={() => { download }}>Download</Button>
                    </div>
                  </div>
                </div>}
              </div>
            </div>
          }
        </div>
      </div>
      {isLoading && <Loading />}
      {steps[0] == false ? <Description /> : <AirdropTable list={list} />}
    </div >
  );
}
