import { createContext, useContext, useState } from "react";

export const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [isSigned, setIsSigned] = useState(false);
  
  return (
    <AppContext.Provider values={{ isSigned, setIsSigned }}>
      {children}
    </AppContext.Provider>
  );
};
export const useAppContext = () => useContext(AppContext);
