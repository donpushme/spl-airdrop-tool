import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const NavBar = dynamic(() => import("@/components/NavBar"), {
  ssr: false,
  loading: () => <div className=""></div>,
});

export default function Home() {
  return (
    <div>
      <NavBar />
    </div>
  );
}
