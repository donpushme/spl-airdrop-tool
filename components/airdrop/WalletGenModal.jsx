"use client";

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { useModalContext } from "@/contexts/ModalContext";
import { useState, useMemo } from "react";

export default function WalletGenModal() {
  const [checked, setChecked] = useState(false);
  const [copied, setCopied] = useState(false)
  const { showWalletGenModal, closeWalletGenModal, setWallet } = useModalContext();
  const keyPair = Keypair.generate();
  const secretKey = useMemo( () => bs58.encode(keyPair.secretKey),[]);
  const closeModal = () =>{
    setChecked(false)
    setCopied(false)
    closeWalletGenModal();
  }
  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(secretKey);
      setCopied(true)
    } catch(error) {
      console.log(error)
    }
  }

  const walletGenerated = () => {
    closeModal();
    setWallet(secretKey)
  }

  return (
    showWalletGenModal && (
      <div className="fixed flex w-full h-full items-center justify-center z-50 animate-in fade-in duration-1000">
        <div className="absolute w-full h-full items-center opacity-80 bg-background justify-center" onClick={closeModal}></div>
        <div className="flex flex-col items-center w-[500px] border bg-background py-16 rounded-lg z-40">
          Temporary Wallet Address
          <div className="w-[400px] border rounded text-center text-wrap break-all p-2 hover:cursor-pointer hover:border-white mt-2" onClick={copyContent}>
            {secretKey}
          </div>
          <div className="text-sm my-4">{copied ? "Copied !" : "Click the secret key to copy"}</div>
          <div className="w-[400px] text-sm border rounded p-2">
          <p className="text-center my-8 text-[16px]">Create a temporay wallet to be used in airdrop</p>
          {TEXT.map((text, index) => {return <p className="my-2 indent-2" key={index}>{`- ${text}`}</p>})}
          <p className="mt-8 text-red-800 text-center"> * Please make sure you correctly created the wallet with the secrete key above. Once you click OK button you can not generate a wallet*</p>
          </div>
          <div className="flex items-center space-x-2 my-4">
            <Checkbox id="terms" onClick={() => {setChecked((pre)=>!pre)}}/>
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept terms and conditions
            </label>
          </div>
          <Button className="rounded-sm" onClick={walletGenerated} disabled={!checked}>OK</Button>
        </div>
      </div>
    )
  );
}


const TEXT = [
  "Click the secret key generated above to copy",
  "Import the secret key into the wallet",
  "Transfer the tokens to the wallet",
  "Transfer given amount of SOL to the wallet",
  "Termiate wallet-generator and perform airdrop"
]
