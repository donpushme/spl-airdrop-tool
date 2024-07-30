import { createContext, useContext, useState, useEffect } from "react";

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [showWalletGenModal, setShowWalletGenModal] = useState(false);
  const [wallet, setWallet] = useState("");

  const openWalletGenModal = () => {
    setShowWalletGenModal(true);
  }

  const closeWalletGenModal = () => {
    setShowWalletGenModal(false)
  }
  return (
    <ModalContext.Provider
      value={{showWalletGenModal, wallet, setWallet, setShowWalletGenModal, openWalletGenModal, closeWalletGenModal}}
    >
      {children}
    </ModalContext.Provider>
  );
};
export const useModalContext = () => useContext(ModalContext);
