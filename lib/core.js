import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createV1,
  mplCore,
  fetchAssetV1,
  transferV1,
  createCollectionV1,
  getAssetV1GpaBuilder,
  Key,
  updateAuthority,
  ruleSet,
  fetchAsset,
  fetchCollection,
} from "@metaplex-foundation/mpl-core";

import {
  TransactionBuilderSendAndConfirmOptions,
  generateSigner,
  signerIdentity,
  sol,
} from "@metaplex-foundation/umi";
import { publicKey } from "@metaplex-foundation/umi";
import { fetchAssetsByCollection } from "@metaplex-foundation/mpl-core";
import { PublicKey } from "@solana/web3.js";
import { HELIUS_RPC } from "@/config";

import { removeDuplicatedHolders } from "./solana";

const umi = createUmi(HELIUS_RPC, "processed").use(mplCore());

/**
 * Route for core NFT
 * @param {string} pubKey
 * This function confirms whether input pubKey is collection or collection asset
 */
export const fetchCoreNft = async (pubKey) => {
  const collection = await getCollection(pubKey);
  console.log(collection);
  return await getCoreByGroup(collection);
};

export const getCoreByGroup = async (pubKey) => {
  const collectionAddress = publicKey(pubKey);

  const assets = await fetchAssetsByCollection(umi, collectionAddress, {
    skipDerivePlugins: false,
  });

  let symbol = await fetchCollection(
    umi,
    publicKey(assets[0].updateAuthority.address),
    {
      skipDerivePlugins: false,
    }
  );
  symbol = symbol.name;
  const nftAndHolder = assets.reduce(
    (acc, cur, index) => {
      acc.nfts.push(cur.publicKey);
      acc.holders.push(cur.owner);
      return acc;
    },
    { nfts: [], holders: [] }
  );
  const { nfts, holders } = nftAndHolder;
  const holderList = removeDuplicatedHolders(holders, symbol);
  return { nfts, holderList};
};

const getCollection = async (pubKey) => {
  const address = publicKey(pubKey);
  try {
    const asset = await fetchAsset(umi, address, {
      skipDerivePlugins: false,
    });
    console.log(asset);
    const collection = asset.updateAuthority.address;
    return collection;
  } catch (error) {
    console.log(error);
    return pubKey;
  }
};
