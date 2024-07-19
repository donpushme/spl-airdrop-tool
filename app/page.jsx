"use client";

import { useRouter, useEffect } from "next/navigation";

export default function Home() {
  const router = useRouter();
  router.push("/snapshot");
  return <></>;
}
