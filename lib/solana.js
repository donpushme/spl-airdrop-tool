import { HELIUS_RPC } from "@/config";

export const getWalletAssets = async (address) => {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: address,
          page: 1, // Starts at 1
          limit: 1000,
        },
      }),
    });
    const { result } = await response.json();
    const items = result.items;
    const nfts = items.reduce((acc, cur, index)=>{
      acc.push({id:cur.id, image:cur.content.links.image});
      return acc;
    }, [])
    return nfts
}