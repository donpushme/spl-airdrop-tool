import { createContext, useContext, useState, useEffect } from "react";

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [showWalletGenModal, setShowWalletGenModal] = useState(false);
  const [tempWallet, setTempWallet] = useState("");

  const openWalletGenModal = () => {
    setShowWalletGenModal(true);
  }

  const closeWalletGenModal = () => {
    setShowWalletGenModal(false)
  }
  return (
    <ModalContext.Provider
      value={{showWalletGenModal, tempWallet, setTempWallet, setShowWalletGenModal, openWalletGenModal, closeWalletGenModal}}
    >
      {children}
    </ModalContext.Provider>
  );
};
export const useModalContext = () => useContext(ModalContext);
