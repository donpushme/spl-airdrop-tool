"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCallback, useState, useEffect } from "react";
import FTOwnerTable from "@/components/snapshot/FTOwberTable";
import { CardWithForm } from "@/components/snapshot/FTCard";

export default function Snapshot() {
  const [inputValue, setInputValue] = useState("");
  const [ftOwners, setFtOwners] = useState([]);

  return (
    <div className="w-full">
      <CardWithForm ftOwners={ftOwners} setFtOwners={setFtOwners}/>
      <FTOwnerTable ftOwners={ftOwners} />
    </div>
  );
}
