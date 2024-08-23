import { GreenBtn1, GreenBtn2, GreenBtn3, UserListIcon } from "../Assests/icons/Icon";

export default function Description() {
  return (
    <div className="flex flex-wrap justify-center gap-[42px] w-full md:w-9/12 mx-auto">
      <div className="rounded-[6px] w-11/12 lg:w-[700px] xl:w-1/4 py-4 px-8 border">
        <div className="my-4">
          <GreenBtn1 size={20} />
        </div>
        <div className="text-xl my-2">Take a snapshot</div>
        <div className="text-gray-400 text-sm">
          Easily take a snapshot of any NFT collection within seconds to either
          get a full hashlist or holderlist
        </div>
      </div>
      <div className="rounded-[6px] w-11/12 lg:w-[700px] xl:w-1/4 py-4 px-8 border">
        <div className="my-4">
          <GreenBtn2 size={20} />
        </div>
        <div className="text-xl my-2">Combine Snapshot</div>
        <div className="text-gray-400 text-sm">
          See comprehensive insights by aggregating information from different
          NFT collections. Understand how ownership is distributed across
          multiple collections. With future potential for advance holder
          connected airdrop.
        </div>
      </div>
      <div className="rounded-[6px] w-11/12 lg:w-[700px] xl:w-1/4 py-4 px-8 border">
        <div className="my-4">
          <GreenBtn3 size={20} />
        </div>
        <div className="text-xl my-2">Take a snapshot</div>
        <div className="text-gray-400 text-sm">
          Easily take a snapshot of any NFT collection within seconds to either
          get a full hashlist or holderlist
        </div>
      </div>
    </div>
  );
}
