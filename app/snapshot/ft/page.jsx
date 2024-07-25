"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCallback, useState, useEffect } from "react";
import FTOwnerTable from "@/components/snapshot/FTOwberTable";
import { CardWithForm } from "@/components/snapshot/FTCard";

export default function Snapshot() {
  const [inputValue, setInputValue] = useState("");
  const [ftOwners, setFtOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState();

  /**
   * Get the list of NFT holders and can continuously combine with new collection holder list
   */
  const getHolderList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ftSnapshot(inputValue);
      console.log(res)
      if (res.length) {
        setFtOwners(res);
        setIsLoading(false);
        setInputValue("");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, [inputValue, setFtOwners, setIsLoading]);

  const handleChange = useCallback(
    (e) => {
      setInputValue(e.target.value);
    },
    [setInputValue]
  );

  const downloadAsJson = useCallback(() => {
    if (ftOwners.length > 0) downloadObjectAsJson(ftOwners, "holder_list");
  }, [ftOwners]);

  const downloadAsCsv = useCallback(() => {
    if (ftOwners.length > 0) downloadOwnersAsCsv(ftOwners, "holder_list");
  }, [ftOwners]);

  return (
    <div className="w-full">
      <CardWithForm ftOwners={ftOwners} setFtOwners={setFtOwners}/>
      <FTOwnerTable ftOwners={ftOwners} />
    </div>
  );
}
