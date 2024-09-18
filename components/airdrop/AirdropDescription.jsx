import { DatabaseIcon, GearIcon, ProtectShieldIcon } from "../Assests/icons/Icon";

export default function Description() {
  return (
    <div className="flex flex-wrap justify-center gap-[42px] w-full md:w-9/12 mx-auto my-8">
      <div className="rounded-[6px] w-11/12 lg:w-[900px] xl:w-1/4 py-4 px-8 border">
        <div className="my-4">
          <DatabaseIcon size={20} />
        </div>
        <div className="text-lg my-2">Seamless Snapshot Integration</div>
        <div className="text-gray-400 text-sm">
          Import and manage snapshots with ease, whether single or combined, ensuring accurate and efficient token distribution to your holders.
        </div>
      </div>
      <div className="rounded-[6px] w-11/12 lg:w-[900px] xl:w-1/4 py-4 px-8 border">
        <div className="my-4">
          <GearIcon size={20} />       
        </div>
        <div className="text-lg my-2">Customizable Allocation Rules</div>
        <div className="text-gray-400 text-sm">
          Leverage advanced multiplier options for combined snapshots, allowing you to reward holders based on specific NFT combinations for greater flexibility.
        </div>
      </div>
      <div className="rounded-[6px] w-11/12 lg:w-[900px] xl:w-1/4 py-4 px-8 border">
        <div className="my-4">
          <ProtectShieldIcon size={20} />
        </div>
        <div className="text-lg my-2">Secure Wallet Generation</div>
        <div className="text-gray-400 text-sm">
          Generate a dedicated wallet for managing your airdrop transaction with ease. Securely fund it and access the secret key for complete control over the distribution process.
        </div>
      </div>
    </div>
  );
}
