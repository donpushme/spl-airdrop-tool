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
        <div className="text-xl my-2">Custom parameters</div>
        <div className="text-gray-400 text-sm">
          Easily set your own parameters on how you want your snapshot to be structoured and easily filter for the result
        </div>
      </div>
      <div className="rounded-[6px] w-11/12 lg:w-[700px] xl:w-1/4 py-4 px-8 border">
        <div className="my-4">
          <GreenBtn3 size={20} />
        </div>
        <div className="text-xl my-2">Take a snapshot</div>
        <div className="text-gray-400 text-sm">
          Export the list of NFTs holder or mint addresses to file like csv or json for future airdrops and whitelist/allow list
        </div>
      </div>
    </div>
  );
}
