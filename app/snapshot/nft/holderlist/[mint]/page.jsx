"use client";

import HashList from "@/components/snapshot/HashList";
import ResultHead from "@/components/snapshot/ResultHead";
import { useAppContext } from "@/contexts/AppContext";
import { usePathname } from "next/navigation";
import { useEffect,useState, useCallback } from "react";
import { inputRouter } from "@/lib/nftSnapshot";
import { useAlertContext } from "@/contexts/AlertContext";
import Spinner_1 from "@/components/Assests/spinner/Spinner_1";

export default function Page() {
  const path = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [holderlist, setHolderlist] = useState([])
  const { mint, setMint } = useAppContext();
  const {alert, setAlert} = useAlertContext();

  useEffect(() => {
    setMint(path.split("/holderlist/")[1])
    getHolderlist(path.split("/holderlist/")[1]);
  }, [path]);

   /**
   * Get the list of NFT
   */
   const getHolderlist = useCallback(async (address) => {
    setIsLoading(true);
    try {
      const res = await inputRouter(address, "holderlist");
      Array.isArray(res) && res.length ? setHolderlist(res) : setHolderlist([]);
      setIsLoading(false);
      setMint("");
    } catch (error) {
      console.log(error);
      setAlert({
        ...ErrorAlert,
        text: "Something went wrong",
      });
      setIsLoading(false);
    }
  }, [mint, setHolderlist]);

  return (
    <div className="lg:w-[1024px] w-[95%]">
      <ResultHead />
      {isLoading ? <Spinner_1/> : <HashList list={holderlist}/>}
    </div>
  );
}
