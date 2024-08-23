import Image from "next/image";

export default function BackImage({ className }) {
  return (
    <div className="fixed w-full h-[100vh] overflow-hidden z-[-1]">
      <div className="absolute rotate-12 w-[40%] left-full top-[100px] -translate-x-1/2">
        <div className={`{relative w-full aspect-square opacity-[0.5%]`}>
          <Image src="/logo.svg" fill alt="" />
        </div>
      </div>
      <div className="absolute -rotate-12 w-[40%] left-0 top-1/2 -translate-x-1/2">
        <div className={`{relative w-full aspect-square opacity-[0.5%]`}>
          <Image src="/logo.svg" fill alt="" />
        </div>
      </div>
    </div>
  );
}
