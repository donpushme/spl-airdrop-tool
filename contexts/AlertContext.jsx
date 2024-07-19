import { createContext, useContext, useState } from "react";
import { HideAlert } from "@/lib/alerts";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  // For when the left nav is open and closed at tablet and below
  const [alert, setAlert] = useState(HideAlert);
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
