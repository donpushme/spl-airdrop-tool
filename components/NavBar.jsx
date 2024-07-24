"use client";

import { useState, useEffect, useCallback } from "react";
import { UserIcon, Wallet2Icon, Moon, Sun, SunMoon } from "lucide-react";
import { Button } from "./ui/button";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import WalletModal from "@/components/WalletModal";
import { AlertCom } from "@/components/AlertCom";
import { useAlertContext } from "@/contexts/AlertContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { signIn, testSign } from "@/action";
import { useAppContext } from "@/contexts/AppContext";
import { SuccessAlert, ErrorAlert } from "@/lib/alerts";
import { useTheme } from "next-themes";

export default function NavBar() {
  const [error, setError] = useState(null);
  const wallet = useWallet();
  const { setVisible: setModalVisible } = useWalletModal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { alert, setAlert } = useAlertContext();
  const { isSigned, setIsSigned } = useAppContext();
  const { setTheme, theme } = useTheme();
  const [mode, setMode] = useState(theme);
  const {
    buttonState,
    onConnect,
    onDisconnect,
    publicKey,
    walletIcon,
    walletName,
  } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });

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
      case "has-wallet":
        console.log(buttonState);
        if (onConnect) {
          onConnect();
        }
        break;
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

  const test = async () => {
    await testSign();
  };

  return (
    <nav className="fixed w-full flex justify-end border-border h-32 items-center px-4 gap-2">
      <AlertCom />
      {isSigned ? (
        <Button onClick={signOut}>
          <UserIcon />
          SIGN OUT
        </Button>
      ) : (
        <Button onClick={sign}>
          <UserIcon />
          SIGN IN
        </Button>
      )}
      <Button onClick={handleWalletChange}>
        <Wallet2Icon />
        {buttonState == "no-wallet" ? "Connect Wallet" : "Disconnect Wallet"}
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
      <WalletModal isOpen={isModalOpen} onClose={closeModal} />
      
    </nav>
  );
}
