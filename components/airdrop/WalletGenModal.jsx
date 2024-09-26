"use client";

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { useModalContext } from "@/contexts/ModalContext";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { CopyIcon, EyeIcon, NextArrow, WalletIcon } from "../Assests/icons/Icon";
import { Label } from "../ui/label";
import CopyButton from "./CopyButton";
import { XIcon } from "lucide-react";

export default function WalletGenModal() {
  const [checked, setChecked] = useState(false);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [copied, setCopied] = useState(false)
  const { showWalletGenModal, closeWalletGenModal, setTempWallet } = useModalContext();
  const [isShow, setIsShow] = useState(false);

  const secretKey = useRef(null);
  const publicKey = useRef(null);

  useEffect(() => {
    const keyPair = Keypair.generate();
    secretKey.current = bs58.encode(keyPair.secretKey);
    publicKey.current = keyPair.publicKey.toBase58()
  }, [])

  useEffect(() => {
    setChecked(check1 && check2 && check3)
  }, [check1, check2, check3])


  const closeModal = () => {
    setChecked(false)
    setCopied(false)
    closeWalletGenModal();
  }

  const walletGenerated = () => {
    closeModal();
    setTempWallet(secretKey.current)
  }

  const toggleShow = () => {
    setIsShow(!isShow)
  }
  return (
    showWalletGenModal && (

      <div className="fixed flex w-full h-full items-center justify-center z-50 animate-in fade-in duration-1000 bg-gray-800/50">

        <div className=" relative flex flex-col p-9 border bg-background rounded-lg z-40">
          <XIcon className="absolute right-2 top-2 hover:cursor-pointer" onClick={closeModal} />
          <div className="flex items-center gap-2 mb-4"><WalletIcon /> Temporary Wallet Generated</div>
          <div>
            <Label>Wallet Address</Label>
            <div className="text-gray-400 italic text-sm flex relative gap-2 items-center">{publicKey.current}<div className="hover:cursor-pointer"><CopyButton value={publicKey.current} /></div></div>
          </div>
          <div className="my-4 space-y-1">
            <Label>Private Key</Label>
            <div className="text-gray-400 text-sm italic">Please import the private key to yoru browser wallet or save it to your computer for future access.</div>
            <div className="flex items-center border p-2 rounded">
              <input value={secretKey.current} type={isShow ? "text" : "password"} className="m-0 overflow-hidden w-[calc(100%-50px)] bg-transparent text-xs p-2 hover:cursor-pointer hover:border-white truncate" disabled />
              <div className="flex itmes-center justify-between w-[50px]">
                <div className="hover:cursor-pointer" onClick={toggleShow}><EyeIcon /></div>
                <div className="mt-1 hover:cursor-pointer"><CopyButton value={secretKey.current} /></div>
              </div>
            </div>
          </div>
          <div className="px-4">
            <div className="flex items-center gap-2 my-6">
              <Checkbox id="terms" onClick={() => { setCheck1((pre) => !pre) }} />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Accept terms of service.
              </label>
            </div>
            <div className="flex items-center gap-2 my-6">
              <Checkbox id="terms" onClick={() => { setCheck2((pre) => !pre) }} />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have copied the private key.
              </label>
            </div>
            <div className="flex items-center gap-2 my-6">
              <Checkbox id="terms" onClick={() => { setCheck3((pre) => !pre) }} />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have imported or saved the private key to my wallet or computer.
              </label>
            </div>
          </div>
          <Button className="rounded-sm gap-2 border hover:border-green" onClick={walletGenerated} disabled={!checked}>Next <NextArrow /></Button>
        </div>
      </div>

    )
  );
}
