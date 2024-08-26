"use client";

import { Button } from "@/components/ui/button";
import { useAlertContext } from "@/contexts/AlertContext";
import { useRouter } from "next/navigation";

export default function ResultHead() {
  const router = useRouter()
  return (
    <div className="flex justify-between h-[100px] items-end hover:border-green border-0">
      <div>
        <div className="text-[50px] font-bold h-fit">NFT Snapshot</div>
        <div>Take and export NFT holders snapshot anywhere anytime</div>
      </div>
      <Button className="gap-2 px-8 h-[40px] bg-foreground hover:bg-primary-background font-bold text-background" onClick={()=>{router.push("/snapshot/nft")}}>
        New
      </Button>
    </div>
  );
}
