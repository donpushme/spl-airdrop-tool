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
import { ProfileDropDown } from "./ProfileDropDown";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletModal from "@/components/WalletModal";
import { AlertCom } from "@/components/AlertCom";
import RightBar from "@/components/RightBar";
import { useAppContext } from "@/contexts/AppContext";
import { useAlertContext } from "@/contexts/AlertContext";
import { SuccessAlert, ErrorAlert } from "@/lib/alerts";
import { useTheme } from "next-themes";
import { NavMenu } from "./NavMenu";
import { signIn, testSign } from "@/action";
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
    publicKey,
    walletIcon,
    walletName,
  } = useWalletMultiButton({});

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
        signOut();
        onDisconnect();
    }
  };

  //SignUp and signIn at once.
  const sign = useCallback(async () => {
    console.log(isSigned);
    if (buttonState !== "connected") {
      setAlert({
        ...ErrorAlert,
        title: "Wallet Disconnected",
        text: "Please connect your wallet",
      });
      openModal();
      return;
    }
    const response = await signIn(publicKey, wallet);
    setAlert(response.alert);
    if (response.alert.visible) setIsSigned(true);
  }, [wallet, publicKey, setAlert, buttonState, isSigned, setIsSigned]);

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
          <RightBar signIn={sign} signOut={signOut} isSigned={isSigned}/>
        </div>
      </nav>
      <WalletModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
}
