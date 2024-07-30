"use client";

import Image from "next/image";

const NFTticket = (props) => {
  const { className } = props || "";
  const { src, id, onClick } = props;

  return (
    <div className={`${className} relative aspect-square w-[50px] h-[50px]`} >
      <Image loader={() => src} src="me.png" fill alt="" className="rounded hover:scale-110" id={id} onClick={onClick}/>
    </div>
  );
};

export default NFTticket;
