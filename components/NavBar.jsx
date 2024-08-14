"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserIcon,
  UserRound,
  Wallet2Icon,
  Moon,
  Sun,
  SunMoon,
  HistoryIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import WalletModal from "@/components/WalletModal";
import { AlertCom } from "@/components/AlertCom";
import RightBar from "@/components/RightBar";
import { useAppContext } from "@/contexts/AppContext";
import { useAlertContext } from "@/contexts/AlertContext";
import { SuccessAlert, ErrorAlert } from "@/lib/alerts";
import { useTheme } from "next-themes";
import { NavMenu } from "./NavMenu";
import { signIn } from "@/action";
import Logo from "./Logo";
import WalletGenModal from "./airdrop/WalletGenModal";

export default function NavBar({ className }) {
  const [error, setError] = useState(null);
  const wallet = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { alert, setAlert } = useAlertContext();
  const { isSigned, setIsSigned, setShowSideBar, setMouseTrack } =
    useAppContext();
  const { setTheme, theme } = useTheme();
  const [mode, setMode] = useState(theme);
  const {
    buttonState,
    onConnect,
    onDisconnect,
    onSelectWallet,
    publicKey,
    walletIcon,
    walletName,
  } = useWalletMultiButton({});

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    if (!isSigned) sign();
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
  }, [buttonState, setAlert]);

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
    if (buttonState == "connected") {
      const response = await signIn(wallet);
      console.log(response)
      setAlert(response.alert);
      setIsSigned(response.isSigned);
      if(!response.isSigned) onDisconnect()
    }
  }, [wallet, setAlert, buttonState, setIsSigned]);

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
        className={`${className} fixed w-full flex justify-between border-border h-20 items-center px-4 backdrop-blur-sm bg-primary-background/30 border-b`}
      >
        <div className="flex gap-8">
          <Logo />
          <NavMenu />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleWalletChange}>
            <Wallet2Icon className="mr-3" />
            {buttonState == "no-wallet" ? "Connect" : "Disconnect"}
          </Button>
          {mode == "light" && (
            <Button
              onClick={() => {
                setTheme("dark");
                setMode("dark");
              }}
            >
              {" "}
              <Moon />
            </Button>
          )}
          {mode == "dark" && (
            <Button
              onClick={() => {
                setTheme("light");
                setMode("light");
              }}
            >
              {" "}
              <Sun />{" "}
            </Button>
          )}
          {/* <HistoryIcon
          onClick={() => {
            setShowSideBar((prev) => !prev);
            setMouseTrack((prev) => !prev);
          }}
        /> */}
          {/* <ProfileDropDown sign={sign} signOut={signOut} isSigned={isSigned} /> */}
          {/* <RightBar signIn={sign} signOut={signOut} isSigned={isSigned} /> */}
        </div>
      </nav>
      <WalletModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
