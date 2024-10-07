"use client";

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "../ui/button";
import { useModalContext } from "@/contexts/ModalContext";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { BackArrow, CopyIcon, EyeIcon, NextArrow, WalletIcon } from "../Assests/icons/Icon";
import { Label } from "../ui/label";
import CopyButton from "./CopyButton";
import { XIcon } from "lucide-react";
import { useToken } from "@/hooks/useToken";
import Image from "next/image";
import { useAppContext } from "@/contexts/AppContext";
import { checkBalance } from "@/lib/solana";
import { ErrorAlert } from "@/lib/alerts";
import { useAlertContext } from "@/contexts/AlertContext";

export default function WalletGenModal() {
  const [checked, setChecked] = useState(false);
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [copied, setCopied] = useState(false)
  const { showWalletGenModal, closeWalletGenModal, setTempWallet, totalAmount, fee } = useModalContext();
  const [isShow, setIsShow] = useState(false);
  const { token, isLoading } = useToken();
  const [step, setStep] = useState(1);
  const { setCanStartAirdrop } = useAppContext();
  const {setAlert} = useAlertContext()

  const secretKey = useRef(null);
  const publicKey = useRef(null);

  useEffect(() => {
    const keyPair = Keypair.generate();
    secretKey.current = bs58.encode(keyPair.secretKey);
    publicKey.current = keyPair.publicKey.toBase58();
    console.log("tokeninfo", token)
  }, [token])

  useEffect(() => {
    setChecked(check1 && check2 && check3)
  }, [check1, check2, check3])


  const closeModal = () => {
    setChecked(false)
    setCopied(false)
    closeWalletGenModal();
  }

  const walletGenerated = useCallback(async () => {
    const {solFunded, tokenFunded} = await checkBalance(publicKey.current, token.address, fee, totalAmount);
    if (!solFunded && !tokenFunded) {
      setAlert({...ErrorAlert, text: "The wallet is not funded with both SOL and token"})
      return
    } else if(!solFunded) {
      setAlert({...ErrorAlert, text: "The wallet is not funded with SOL"})
      return
    } else if(!tokenFunded){
      setAlert({...ErrorAlert, text: "The wallet is not funded with token"})
      return
    }
    closeModal();
    setTempWallet(secretKey.current);
    setCanStartAirdrop(true);
  }, [publicKey, token, fee, totalAmount, secretKey])

  const toggleShow = () => {
    setIsShow(!isShow)
  }

  const nextStep = () => {
    setStep(step + 1)
  }

  const prevStep = () => {
    setStep(step - 1);
    setChecked(false);
    setCheck1(false);
    setCheck2(false);
    setCheck3(false);
  }
  return (
    showWalletGenModal && (

      <div className="fixed flex w-full h-full items-center justify-center z-50 animate-in fade-in duration-1000 bg-gray-800/50">

        {/* wallet generation */}
        {step == 1 && <div className=" relative flex flex-col p-9 border bg-background rounded-lg z-40">
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
          <Button className="rounded-sm gap-2 border hover:border-green" onClick={nextStep} disabled={!checked}>Next <NextArrow /></Button>
        </div>}

        {/* Funding  wallet */}
        {step == 2 && <div className=" relative flex flex-col p-9 border bg-background rounded-lg z-40">
          <XIcon className="absolute right-2 top-2 hover:cursor-pointer" onClick={closeModal} />
          <div className="flex items-center gap-2 mb-4"><WalletIcon /> Fund Wallet Generated</div>
          <div className="flex justify-between gap-2 border-b pb-2">
            <div className="flex gap-2">
              <div className="relative aspect-square w-10 rounded-full">
                <Image className="rounded-full" loader={() => token?.image} src="me.png" fill alt="token image" />
              </div>
              <div>
                <div>{token?.name}</div>
                <div className="flex gap-2 text-xs">{token?.address}<CopyButton value={token?.address} /></div>
              </div>
            </div>
            <div className="flex items-center">
              {`${totalAmount} ${token?.symbol}`}
            </div>
          </div>
          <div className="flex justify-between pt-4 pb-2 border-b">
            <div>Estimated Cost</div>
            <div>{`${fee} SOL`}</div>
          </div>

          <div className="pt-4 pb-2">
            <div>Wallet Address</div>
            <div className="text-gray-500 flex gap-2 text-xs">{publicKey.current}<CopyButton value={publicKey.current} /></div>
          </div>

          <div className="pt-4 pb-2 border-b mb-4">
            <div>Note</div>
            <div className="text-gray-500 flex gap-2 text-xs">To be able to start this airdrop you will need to send the listed amount of tokens and SOL to the above public key</div>
          </div>

          <div className="flex justify-between">
            <Button className="rounded gap-2 border hover:border-green" onClick={prevStep}><BackArrow />Back</Button>
            <Button className="rounded gap-2 border hover:border-green" onClick={walletGenerated}>Execute Airdrop <NextArrow /></Button>
          </div>

        </div>}
      </div>

    )
  );
}
