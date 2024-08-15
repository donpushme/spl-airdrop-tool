"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCallback, useState, useEffect } from "react";
import FTOwnerTable from "@/components/snapshot/FTOwberTable";
import FTSnapCard from "@/components/snapshot/FTSnapCard";
import Loading from "@/components/Loading";

export default function Snapshot() {
  const [ftOwners, setFtOwners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="w-full">
      <FTSnapCard
        ftOwners={ftOwners}
        setFtOwners={setFtOwners}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      {isLoading && <Loading />}
      <FTOwnerTable ftOwners={ftOwners} />
    </div>
  );
}
