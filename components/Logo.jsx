"use client";

import Image from "next/image";

export default function Logo() {
  return (
    <div className="relative aspect-square w-[50px]">
      <Image src="/Logo.webp" fill alt="" />
    </div>
  );
}
