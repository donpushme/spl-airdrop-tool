import { Connection, PublicKey, getAccountInfo } from "@solana/web3.js";
import { RPC_URL, NAMASTE_RPC } from "@/config";

export const connection = new Connection(NAMASTE_RPC, "confirmed");

export const getAccountInformation = async (pubKey) => {
  if (pubKey == "") return;

  pubKey = new PublicKey(pubKey);
  console.log(pubKey);
  console.log(PublicKey.isOnCurve(pubKey.toBytes()));
  try {
    const information = await connection.getAccountInfo(pubKey);
    return information;
  } catch (error) {
    console.log(error);
  }
};

export const getAssetsByCreator = async (pubKey) => {
  let page = 1;
  let NFTS = [];
  let holderList = [];
  while (page) {
    const response = await fetch(NAMASTE_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAssetsByCreator",
        params: {
          creatorAddress: pubKey,
          onlyVerified: true,
          page: page, // Starts at 1
          limit: 1000,
        },
      }),
    });
    const { result } = await response.json();
    for (const nfts of result.items) {
      if (nfts.burnt === false) {
        NFTS.push(nfts)
        // holderList.push(nfts.ownership.owner)
      }
    }
    if (result.total !== 1000) {
      page = false
    } else {
      page++
    }
  }
  return {NFTS}
};
