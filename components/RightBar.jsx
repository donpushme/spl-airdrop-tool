"use client";

import { useAppContext } from "@/contexts/AppContext";

export default function RightBar(props) {
  const {showRightBar,setShowRightBar} = useAppContext()
  return <div className={`w-[300px] fixed bottom-0 h-[calc(100vh-96px)] border-l p-4 duration-300 ${showRightBar ? "right-0" : "-right-full"}`}>RightBar</div>;
}
