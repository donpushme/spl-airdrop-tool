"use client";

import HolderList from "@/components/snapshot/HolderList";
import ResultHead from "@/components/snapshot/NFTResultHead";
import { ErrorAlert, SuccessAlert } from "@/lib/alerts";
import { useAppContext } from "@/contexts/AppContext";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo, useCallback } from "react";
import { inputRouter } from "@/lib/nftSnapshot";
import { useAlertContext } from "@/contexts/AlertContext";
import Spinner_1 from "@/components/Assests/spinner/Spinner_1";
import { combineTwoHolderList } from "@/lib/nftSnapshot";
import { isValidSolanaAddress } from "@/lib/solana";
import { uploadList } from "@/action";

export default function Page() {
  const path = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [holderlist, setHolderlist] = useState([]);
  const { isSigned, mint, setMint } = useAppContext();
  const { alert, setAlert } = useAlertContext();
  const [newAddress, setNewAddress] = useState("");

  /**
   * Get the list of NFT holders and can continuously combine with new collection holder list
   */
  const getHolderlist = useCallback(
    async (address) => {
      if (!isValidSolanaAddress(address)) return;
      setIsLoading(true);
      try {
        const res = await inputRouter(address, "holderlist");
        if (res.holderList) {
          setHolderlist(combineTwoHolderList(holderlist, res.holderList));
          setMint("");
        } else if (res.alert.visible) {
          setAlert(res.alert);
        } else {
          setAlert({ ...ErrorAlert, text: "Something went wrong" });
        }
      } catch (error) {
        console.log(error);
        setAlert({
          ...ErrorAlert,
          text: "Something went wrong",
        });
      }
      setIsLoading(false);
    },
    [holderlist, setAlert, setMint]
  );

  useEffect(() => {
    setMint(path.split("/holderlist/")[1]);
    getHolderlist(path.split("/holderlist/")[1]);
  }, [path]);

  useEffect(() => {
    if(isLoading == false && holderlist?.length > 0 && isSigned){
      uploadList(holderlist);
    }
  },[isLoading, holderlist])

  return (
    <div className="lg:w-[1024px] w-[95%]">
      <ResultHead />
      {isLoading ? (
        <Spinner_1 />
      ) : (
        <HolderList
          list={holderlist}
          setList={setHolderlist}
          newAddress={newAddress}
          setNewAddress={setNewAddress}
          getHolderlist={getHolderlist}
        />
      )}
    </div>
  );
}
