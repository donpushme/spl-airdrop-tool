"use client";

import NftOwners from "@/components/snapshot/NftOwners";
import NFTSnapCard from "@/components/snapshot/NFTSnapCard";
import { useState, useMemo } from "react";
import Loading from "@/components/Loading";
import Description from "@/components/snapshot/Description";
import Collections from "@/components/snapshot/Collections";

export default function Snapshot() {
  const [showCollections, setShowCollections] = useState(false);
  const cardParams = useMemo(() => {
    return {
      showCollections,
      setShowCollections,
    };
  }, [
    showCollections,
    setShowCollections,
  ]);
  return (
    <div className="w-full">
      <NFTSnapCard
        params = {cardParams}
      />
      {showCollections ? <Collections /> : <Description />}
    </div>
  );
}
