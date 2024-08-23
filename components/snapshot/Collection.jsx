"use client";

import Image from "next/image";
import CollectionToolTip from "./CollectionToolTip";
import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";

export default function Collection({ collection }) {
  const [showToolTip, setShowToolTip] = useState(false);
  const { setMint } = useAppContext();

  return (
    <div
      className="relative aspect-square rounded-[6px] shadow-blur hover:cursor-pointer"
      onClick={() => {
        setMint(collection.address);
      }}
      onMouseOver={() => {
        setShowToolTip(true);
      }}
      onMouseOut={() => {
        setShowToolTip(false);
      }}
    >
      <Image
        className="rounded-[6px]"
        src={`/collections/${collection.url}`}
        fill
        alt=""
      />
      <CollectionToolTip show={showToolTip} text={collection.name} />
    </div>
  );
}
