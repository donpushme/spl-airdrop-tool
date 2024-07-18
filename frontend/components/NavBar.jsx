"use client";

import { useState, useEffect, useCallback } from "react";
import { UserIcon, Wallet2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import WalletModal from "@/components/WalletModal";
import { AlertCom } from "@/components/AlertCom";
import { useAlertContext } from "@/contexts/AlertContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { signIn, testSign } from "@/action";
import { useAppContext } from "@/contexts/AppContext";

export default function NavBar() {
  const [error, setError] = useState(null);
  const wallet = useWallet();
  const { setVisible: setModalVisible } = useWalletModal();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { alert, setAlert } = useAlertContext();
  const { isSigned, setIsSigned } = useAppContext()
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
        visible: true,
        title: "Wallet Disconnected",
        text: "Please connect your wallet",
        type: "distructed",
      });
    }
  }, [buttonState]);

  const handleWalletChange = (event) => {
    switch (buttonState) {
      case "no-wallet":
        openModal();
        break;
      // case "has-wallet":
      //   console.log(buttonState)
      //   if (onConnect) {
      //     onConnect();
      //   }
      //   break;
      default:
        onDisconnect();
    }
  };

  const sign = useCallback( async () => {
    if (buttonState !== "connected") {
      setAlert({
        visible: true,
        title: "Wallet Disconnected",
        text: "Please connect your wallet",
        type: "distructed",
      });
      openModal();
      return;
    }
    const response = await signIn(publicKey, wallet);
    setAlert(response.alert)
    setIsSigned(true);
  }, [wallet, publicKey, setAlert, buttonState, setIsSigned])

  const signOut = useCallback (async () => {
    window.localStorage.removeItem("token")
  },[])

  const test = async () => {
    await testSign();
  }

  return (
    <nav className="relative flex justify-end border-border h-16 items-center px-4">
      <AlertCom />
      {isSigned ? (
      <Button onClick={signOut} className="mr-4">
        <UserIcon />
        SIGN OUT
      </Button>
      ) :
      (
        <Button onClick={sign} className="mr-4">
        <UserIcon />
        SIGN IN
      </Button>
      )
      }
      <Button onClick={handleWalletChange}>
        <Wallet2Icon />
        {buttonState == "no-wallet" ? "Connect Wallet" : "Disconnect Wallet"}
      </Button>
      <WalletModal isOpen={isModalOpen} onClose={closeModal} />
    </nav>
  );
}
