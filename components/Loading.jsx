'use client'

import Image from 'next/image';

export default function Loading() {
  return (
    <div className="relative mx-auto aspect-square w-[50px] m-8">
      <Image src="/spinner/spinner_1.gif" layout="fill" alt="Loading..." />
    </div>
  );
}
