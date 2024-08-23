"use client";

import HashList from "@/components/snapshot/HashList";
import ResultHead from "@/components/snapshot/ResultHead";
import { useAppContext } from "@/contexts/AppContext";
import { usePathname } from "next/navigation";
import { useEffect,useState, useCallback } from "react";
import { inputRouter } from "@/lib/nftSnapshot";
import { useAlertContext } from "@/contexts/AlertContext";
import { ErrorAlert, SuccessAlert } from "@/lib/alerts";
import Spinner_1 from "@/components/Assests/spinner/Spinner_1";

export default function Page() {
  const path = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [hashlist, setHashlist] = useState([])
  const { mint, setMint } = useAppContext();
  const {alert, setAlert} = useAlertContext();

  useEffect(() => {
    setMint(path.split("/hashlist/")[1])
    getHasList(path.split("/hashlist/")[1]);
  }, [path]);

   /**
   * Get the list of NFT
   */
   const getHasList = useCallback(async (address) => {
    setIsLoading(true);
    try {
      const res = await inputRouter(address, "hashlist");
      Array.isArray(res) && res.length ? setHashlist(res) : setHashlist([]);
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
  }, [mint, setHashlist]);

  return (
    <div className="lg:w-[1024px] w-[95%]">
      <ResultHead />
      {isLoading ? <Spinner_1/> : <HashList list={hashlist}/>}
    </div>
  );
}
