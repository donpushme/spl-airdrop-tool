import { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export const initialAlert = {
  visible: false,
  title: "Default title",
  text: "Customized text goes here",
  type: "normal",
};

export function AlertProvider({ children }) {
  // For when the left nav is open and closed at tablet and below
  const [alert, setAlert] = useState(initialAlert);
  return (
    <AlertContext.Provider
      value={{
        alert,
        setAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertContext () {
  return useContext(AlertContext);
};
