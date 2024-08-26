"use client";

import { useCallback, useState, useEffect } from "react";
import FTSnapCard from "@/components/snapshot/FTSnapCard";
import TokenSnapshotDescription from '@/components/snapshot/TokenSnapshotDescription'


export default function Snapshot() {
  return (
    <div className="w-full">
      <FTSnapCard />
      <TokenSnapshotDescription/>
    </div>
  );
}
