import { createContext, useContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isSigned, setIsSigned] = useState(false);
  const [showRightBar, setShowRightBar] = useState(false);
  const [showLeftBar, setShowLeftBar] = useState(false);
  const [mouseTrack, setMouseTrack] = useState(true);
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!mouseTrack) return;
      if (event.clientY < 96) return;

      if (event.clientX < 20) {
          setShowLeftBar(true);          
      }

      if (event.clientX > 300) {
        setShowLeftBar(false);
      }
      
      if(event.clientX > window.innerWidth - 20){
          setShowRightBar(true);
      }

      if(event.clientX < window.innerWidth - 300){
        setShowRightBar(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [setShowLeftBar, setShowRightBar, mouseTrack]);

  return (
    <AppContext.Provider
      value={{
        isSigned,
        showRightBar,
        showLeftBar,
        setShowLeftBar,
        setShowRightBar,
        setIsSigned,
        setMouseTrack,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export const useAppContext = () => useContext(AppContext);
