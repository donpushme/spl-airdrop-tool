import { Connection, PublicKey } from "@solana/web3.js";
import { HELIUS_RPC } from "@/config";
import {
  SYSTEM_PROGRAM,
  TOKEN2022_PROGRAM,
  TOKEN_PROGRAM,
  BPF_UPGRADABLE_LOADER,
  MPL_CORE_PROGRAM,
} from "@/config/solanaAccouts";
import { Metaplex } from "@metaplex-foundation/js";
import { fetchCoreNft } from "./coreSnapshot";
import { blacklistedMarketplaceOwners } from "@/config";
import { ErrorAlert } from "./alerts";

export const connection = new Connection(HELIUS_RPC, "confirmed");

/**
 * Maniging the input value
 * @param {string} pubKey
 * @returns
 */
export const inputRouter = async (pubKey, listType) => {
  const len = pubKey.length;
  if (len < 32 || len > 44) {
    const alert = {
      ErrorAlert,
      text: "The address you input is not valid",
    };
    return { alert };
  }

  const accountInfo = await getAccountInformation(pubKey);
  if (accountInfo == null) {
    const { nfts, holderList } = await getAssetsByCreator(pubKey);
    if (listType == "holderlist") {
      //The case of getting holderlist with the count of NFT
      return { holderList };
    }
    return nfts; //The case of getting only hashlist of NFT of the certain collection
  }
  let { owner } = accountInfo;
  owner = owner.toBase58();

  switch (owner) {
    case MPL_CORE_PROGRAM: {
      const { nfts, holderList } = await fetchCoreNft(pubKey);
      if (listType == "holderlist") {
        //The case of getting holderlist with the count of NFT
        return { holderList };
      } else return nfts; //The case of getting only hashlist of NFT of the certain collection
    }
    case SYSTEM_PROGRAM: {
      try {
        const { nfts, holderList } = await getAssetsByCreator(pubKey);
        if (listType == "holderlist") {
          //The case of getting holderlist with the count of NFT
          return { holderList };
        } else return nfts; //The case of getting only hashlist of NFT of the certain collection
      } catch (error) {
        console.log(error);
        const alert = {
          ...ErrorAlert,
          text: "Snapshot by Creator failed",
        };
        return { alert };
      }
    }

    case TOKEN_PROGRAM: // When the use input any NFT address of the collection
    case TOKEN2022_PROGRAM: {
      let metadata;
      try {
        metadata = await getMetadata(pubKey);
      } catch (error) {
        const alert = {
          ...ErrorAlert,
          text: "Gettting Metadata failed",
        };
        return { alert };
      }
      const { tokenStandard, creators, collection } = metadata;
      if (collection == null) {
        try {
          const { nfts, holderList } = await getAssetsByGroup(pubKey);
          if (listType == "holderlist") {
            return { holderList };
          } else return nfts;
        } catch (error) {
          console.log(error, "This nft might not be the collection");
          try {
            if (tokenStandard != 4 && tokenStandard != 0) return;
            const creatorAddress = data.creators[0].address;
            const { nfts, holderList } = await getAssetsByCreator(
              creatorAddress
            );

            if (nfts.length == 0) {
              const alert = {
                ErrorAlert,
                text: "This might not be the creator",
              };
              return { alert };
            }
            if (listType == "holderlist") {
              return { holderList };
            } else return nfts;
          } catch (error) {
            console.log(error, "This might be neither the NFT nor Collection");
            const alert = {
              ErrorAlert,
              text: "This might be neither the NFT nor Collection",
            };
            return { alert };
          }
        }
      } else if (collection) {
        const pubKey = collection.address.toBase58();
        const { nfts, holderList } = await getAssetsByGroup(pubKey);
        if (listType == "holderlist") {
          return { holderList };
        } else return nfts;
      }
      if (tokenStandard == 4 || tokenStandard == 0) {
        const creatorAddress = creators[0].address;
        try {
          const { nfts, holderList } = await getAssetsByCreator(creatorAddress);
          if (listType == "holderlist") {
            //The case of getting holderlist with the count of NFT
            return { holderList };
          }
          return nfts; //The case of getting only hashlist of NFT of the certain collection
        } catch (error) {
          console.log(error);
          const alert = {
            ErrorAlert,
            text: "Unknow NFT standard",
          };
          return { alert };
        }
      }
    }
    default:
      const result = await getAccountInformation(owner);
      const grandOwner = result.owner;
      if (grandOwner.toBase58() === BPF_UPGRADABLE_LOADER) {
        try {
          const { nfts, holderList } = await getAssetsByCreator(pubKey);
          if (listType == "holderlist") {
            //The case of getting holderlist with the count of NFT
            return { holderList };
          }
          return nfts; //The case of getting only hashlist of NFT of the certain collection
        } catch (error) {
          const alert = {
            ErrorAlert,
            text: "This is even not a candymachine",
          };
          return { alert };
        }
      }
      const alert = {
        ErrorAlert,
        text: "something went wrong",
      };
      return { alert };
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

  const metadata = await metaplex
    .nfts()
    .findByMint({ mintAddress: mintAddress });
  return metadata;
};

/**
 * Get all the Nfts of the given creater
 * @param {string} pubKey
 * @returns
 */
const getAssetsByCreator = async (pubKey) => {
  let page = 1;
  let nfts = [];
  let holderList = [];
  while (page) {
    const response = await fetch(HELIUS_RPC, {
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
    console.log(result);
    for (const item of result.items) {
      if (item.burnt === false) {
        nfts.push(item.id);
        holderList.push(item.ownership.owner);
      }
    }
    if (result.total !== 1000) {
      page = false;
    } else {
      page++;
    }
  }

  const metadata = await getMetadata(nfts[0]); //Get metadata of any NFT to get the collection name
  const symbol = metadata.symbol;
  holderList = removeDuplicatedHolders(holderList, symbol);
  console.log(holderList);
  return { nfts, holderList };
};

/**
 * Get the holder list of nfts with the collection address
 * @param {string} pubKey
 */
const getAssetsByGroup = async (pubKey) => {
  let page = 1;
  let nfts = [];
  let holderList = [];

  while (page) {
    const response = await fetch(HELIUS_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAssetsByGroup",
        params: {
          groupKey: "collection",
          groupValue: pubKey,
          page: page,
          limit: 1000,
        },
      }),
    });

    const { result } = await response.json();
    for (const item of result.items) {
      if (item.burnt === false) {
        nfts.push(item.id);
        holderList.push(item.ownership.owner);
      }
    }

    if (result.total !== 1000) {
      page = false;
    } else {
      page++;
    }
  }

  const metadata = await getMetadata(nfts[0]); //Get metadata of any NFT to get the collection name
  const symbol = metadata.symbol;
  holderList = removeDuplicatedHolders(holderList, symbol);
  return { nfts, holderList };
};

/**
 * Merge duplicating element of the list increasing the count of them
 * @param {array} list
 * @returns
 */
export const removeDuplicatedHolders = (list, symbol) => {
  list = list.reduce((acc, cur, index) => {
    acc[cur] ? acc[cur]++ : (acc[cur] = 1);
    return acc;
  }, {});

  const holderList = [];
  for (let key in list) {
    if (blacklistedMarketplaceOwners.indexOf(key) >= 0) continue;
    if (list.hasOwnProperty(key)) {
      holderList.push({ owner: key, [symbol]: list[key] });
    }
  }

  return holderList;
};

/**
 * Merge argument arrays into one array with all the properties of both arrays
 * @param {array} list1
 * @param {array} list2
 * @returns merged array
 */
export const combineTwoHolderList = (list1, list2) => {
  if (list1.length == 0) return list2;
  console.log(list1, list2);
  const properties = [Object.keys(list2[0])[1], ...Object.keys(list1[0])];
  const blankObj = properties.reduce((acc, cur, index) => {
    acc[cur] = 0;
    return acc;
  }, {});
  blankObj.owner = "";
  console.log(blankObj);
  const former = list1.reduce((acc, cur, index) => {
    acc[cur.owner] = { ...cur, [properties[0]]: 0 };
    return acc;
  }, {});

  const combined = list2.reduce((acc, cur, index) => {
    acc.hasOwnProperty(cur.owner)
      ? (acc[cur.owner] = {
          ...acc[cur.owner],
          [properties[0]]: cur[properties[0]],
        })
      : (acc[cur.owner] = { ...blankObj, ...cur });
    return acc;
  }, former);
  return Object.values(combined);
};
