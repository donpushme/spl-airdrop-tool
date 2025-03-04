"use client";

import ResultHead from "@/components/snapshot/TokenResultHead";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useAlertContext } from "@/contexts/AlertContext";
import { ErrorAlert, SuccessAlert } from "@/lib/alerts";
import Spinner_1 from "@/components/Assests/spinner/Spinner_1";
import FTOwnerTable from "@/components/snapshot/FTOwnerTable";
import { getParams, ftSnapshot } from "@/lib/ftSnapshot";
import { uploadList } from "@/action";
import { useAppContext } from "@/contexts/AppContext";

export default function Page() {
  const path = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [holderList, setHolderList] = useState([]);
  const { alert, setAlert } = useAlertContext();
  const {isSigned} = useAppContext()
  /**
   * Get the list of NFT holders and can continuously combine with new collection holder list
   */
  const getHolderList = async (mint, min, max, walletLimit) => {
    console.log(walletLimit, typeof walletLimit)
    setIsLoading(true);
    try {
      const minThre = min == "" ? 0 : parseFloat(min);
      const maxThre = max == "" ? 0 : parseFloat(max);
      walletLimit = walletLimit == "" ? 0 : Number(walletLimit);
      const res = await ftSnapshot(mint, minThre, maxThre, walletLimit);
      console.log(res);
      if (res.length) {
        setHolderList(res);
        setIsLoading(false);
      } else {
        setAlert({
          ...ErrorAlert,
          text: "No Owner fetched",
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      setAlert({
        ...ErrorAlert,
        text: "Something went wrong",
      });
    }
  };

  useEffect(() => {
    if (isLoading == false && holderList?.length > 0 && isSigned) {
      console.log("uploading this list", {holderList})
      uploadList(holderList);
      if(response) setAlert({...SuccessAlert, text: "The result is successfully uploaded"})
    }
  }, [isLoading, holderList])

  useEffect(() => {
    const { mint, min, max, walletLimit } = getParams(path);
    getHolderList(mint, min, max, walletLimit);
  }, [path]);

  return (
    <div className="lg:w-[1024px] w-[95%]">
      <ResultHead />
      {isLoading ? <Spinner_1 /> : <FTOwnerTable setHolderList={setHolderList} holderList={holderList} />}
    </div>
  );
}
