"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet2Icon,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "./ui/button";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletModal from "@/components/WalletModal";
import { AlertCom } from "@/components/AlertCom";
import { useAppContext } from "@/contexts/AppContext";
import { useAlertContext } from "@/contexts/AlertContext";
import { SuccessAlert, ErrorAlert } from "@/lib/alerts";
import { useTheme } from "next-themes";
import { NavMenu } from "./NavMenu";
import { signIn } from "@/action";
import WalletGenModal from "./airdrop/WalletGenModal";
import dynamic from "next/dynamic";
const Logo = dynamic(() => import("./Logo"), { ssr: false });

export default function NavBar({ className }) {
  const wallet = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setAlert } = useAlertContext();
  const { isSigned, setIsSigned, setShowSideBar, setMouseTrack } = useAppContext();
  const { setTheme, theme } = useTheme();
  const [mode, setMode] = useState(theme);
  const {
    buttonState,
    onDisconnect,
  } = useWalletMultiButton({});

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    sign();
  };

  useEffect(() => {
    if (buttonState === "connected") {
      closeModal();
    } else if (buttonState === "no-wallet") {
      setAlert({
        ...ErrorAlert,
        title: "Wallet Disconnected",
        text: "Please connect your wallet",
      });
      setIsSigned(false);
    }
  }, [buttonState, setAlert, setIsSigned]);

  const handleWalletChange = () => {
    switch (buttonState) {
      case "no-wallet":
        openModal();
        break;
      // case "has-wallet":
      //   console.log(buttonState);
      //   if (onConnect) {
      //     onConnect();
      //   }
      //   break;
      default:
        if (isSigned) signOut();
        onDisconnect();
    }
  };

  //SignUp and signIn at once.
  const sign = useCallback(async () => {
    if (isSigned) return;
    if (buttonState == "connected") {
      const response = await signIn(wallet);
      console.log(response);
      setAlert(response.alert);
      setIsSigned(response.isSigned);
      if (!response.isSigned) onDisconnect();
    }
  }, [isSigned, buttonState, wallet, setAlert, setIsSigned, onDisconnect]);

  //SignOut by removing the token from LocalStorage
  const signOut = useCallback(async () => {
    window.localStorage.removeItem("token");
    setAlert({ ...SuccessAlert, text: "Signed Out" });
    setIsSigned(false);
  }, [setAlert, setIsSigned]);

  return (
    <>
      <WalletGenModal />
      <AlertCom />
      <nav
        className={`${className} fixed w-full flex justify-between border-border items-center py-4 px-8 backdrop-blur-sm bg-primary-background/30`}
      >
        <div className="flex gap-8">
          <Logo />
          <NavMenu />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleWalletChange}
            className="h-[52px] rounded-[6px] border-0 py-[8px] px-[16px]"
          >
            <Wallet2Icon size={20} className="mr-3" />
            {buttonState == "no-wallet" ? "Connect" : "Disconnect"}
          </Button>
          {mode == "light" && (
            <Button
              className="h-[52px] rounded-[6px] border-0 p-[16px]"
              onClick={() => {
                setTheme("dark");
                setMode("dark");
              }}
            >
              {" "}
              <Moon size={20} />
            </Button>
          )}
          {mode == "dark" && (
            <Button
              className="h-[52px] rounded-[6px] border-0 p-[16px]"
              onClick={() => {
                setTheme("light");
                setMode("light");
              }}
            >
              {" "}
              <Sun size={20} />{" "}
            </Button>
          )}
        </div>
      </nav>
      <WalletModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
