import { Connection, PublicKey, getAccountInfo } from "@solana/web3.js";
import { RPC_URL, NAMASTE_RPC } from "@/config";
import {
  METADATA_PROGRAM,
  SYSTEM_PROGRAM,
  TOKEN2022_PROGRAM,
  TOKEN_PROGRAM,
} from "@/config/solanaAccouts";
import {
  Metadata,
  fetchAllDigitalAssetByCreator,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi";
import { Metaplex } from "@metaplex-foundation/js";

export const connection = new Connection(NAMASTE_RPC, "confirmed");

/**
 * Maniging the input value
 * @param {string} pubKey
 * @returns
 */
export const inputRouter = async (pubKey) => {
  const len = pubKey.length;
  if (len >= 32 && len <= 44) {
    const accountInfo = await getAccountInformation(pubKey);
    console.log(accountInfo);
    let { owner } = accountInfo;
    owner = owner.toBase58();
    console.log(owner);
    switch (owner) {
      case SYSTEM_PROGRAM:
        return "Wallet";
        break;
      case TOKEN_PROGRAM:
      case TOKEN2022_PROGRAM:
        const metadata = getMetadata(pubKey);
        return metadata;
        return getTokenAccounts();
        break;
      case METADATA_PROGRAM:
        return getAssetsByCreator();
        break;
      default:
        return "nothing";
    }
  } else {
    return "invalid address";
  }
};

/**
 * Get the account information of the given account address
 * @param {string} pubKey
 * @returns
 */
export const getAccountInformation = async (pubKey) => {
  pubKey = new PublicKey(pubKey);
  try {
    const information = await connection.getAccountInfo(pubKey);
    return information;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get metadata of SPL token
 * @param {string} pubKey
 * @returns
 */
export const getMetadata = async (pubKey) => {
  const metaplex = Metaplex.make(connection);
  const mintAddress = new PublicKey(pubKey);

  const metadataAccount = metaplex
    .nfts()
    .pdas()
    .metadata({ mint: mintAddress });
  const metadata = await Metadata.load(connection, metadataAccount);

  return metadata;
};

export const getAssetsByCreator2 = async (pubKey) => {
  const umi = createUmi(NAMASTE_RPC);
  const assets = await fetchAllDigitalAssetByCreator(umi, pubKey);
  return assets;
};
/**
 * Get all the Nfts of the given creater
 * @param {string} pubKey
 * @returns
 */
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
        NFTS.push(nfts);
        // holderList.push(nfts.ownership.owner)
      }
    }
    if (result.total !== 1000) {
      page = false;
    } else {
      page++;
    }
  }
  return { NFTS };
};

/**
 * Get all owner address of the given fungible token
 * @param {string} pubKey
 */
const getTokenAccounts = async (pubKey) => {
  let allOwners = new Set();
  let cursor;

  while (true) {
    let params = {
      limit: 1000,
      mint: pubKey,
    };

    if (cursor != undefined) {
      params.cursor = cursor;
    }

    const response = await fetch(NAMASTE_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "helius-test",
        method: "getTokenAccounts",
        params: params,
      }),
    });

    const data = await response.json();

    if (!data.result || data.result.token_accounts.length === 0) {
      console.log("No more results");
      break;
    }

    data.result.token_accounts.forEach((account) => {
      allOwners.add(account.owner);
    });

    cursor = data.result.cursor;
  }
  return allOwners;
};
