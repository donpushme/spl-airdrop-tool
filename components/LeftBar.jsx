"use client";

import { useAppContext } from "@/contexts/AppContext";

export default function LeftBar(props) {
  const {showLeftBar,setShowLeftBar} = useAppContext()
  return <div className={`w-[300px] fixed bottom-0 h-[calc(100vh-80px)] border-r p-4 duration-300 z-50 bg-background ${showLeftBar ? "left-0" : "-left-full"}`}>LeftBar</div>;
}
