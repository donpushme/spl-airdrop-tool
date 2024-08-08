import { HELIUS_RPC } from "@/config";
import {
  transferV1,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { connection, getAccountInformation } from "./nftSnapshot";
import {
  createSignerFromKeypair,
  createSignerFromWalletAdapter,
  keypairIdentity,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { PublicKey } from "@solana/web3.js";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { getMetadata } from "@/lib/nftSnapshot";
import { MPL_CORE_PROGRAM } from "@/config/solanaAccouts";
import { transferV1 as coreNFTTransferV1 } from "@metaplex-foundation/mpl-core";

export const getWalletAssets = async (address) => {
  const response = await fetch(HELIUS_RPC, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: address,
        page: 1, // Starts at 1
        limit: 1000,
      },
    }),
  });

  const { result } = await response.json();
  const items = result.items;
  const nfts = [];

  for (const cur of items) {
    if (cur.interface === "MplCoreAsset") {
      const jsonResponse = await fetch(cur.content.json_uri);
      const jsonData = await jsonResponse.json();
      nfts.push({
        interface: cur.interface,
        id: cur.id,
        image: jsonData.image,
        name: cur.content.metadata.name,
      });
    } else {
      nfts.push({
        interface: cur.interface,
        id: cur.id,
        image: cur.content.links.image,
        name: cur.content.metadata.name,
      });
    } 
  }

  return nfts;
};


export const swapNFT = async (wallet, nftToSwap, targetAddress) => {
  nftToSwap.forEach(async (nft) => {
    let response;
    if(nft.interface == "MplCoreAsset") {
      response = await coreSwap(wallet, nft.id, targetAddress)
    } else response = await transferNFT(wallet, nft.id, targetAddress);
    console.log(response);
  });
  return;
};

const transferNFT = async (wallet, NFTAddress, newOwner) => {

  const { tokenStandard } = await getMetadata(NFTAddress);
  console.log("tokenStandard = ", tokenStandard);
  const umi = createUmi(connection);
  umi.use(walletAdapterIdentity(wallet));
  umi.use(mplToolbox());

  const mint = new PublicKey(NFTAddress);
  const currentOwner = wallet.publicKey;
  newOwner = new PublicKey(newOwner);

  try {
    // Execute the NFT transference
    const transactionSignature = await transferV1(umi, {
      mint,
      authority: umi.identity, // The payer is the current authority
      tokenOwner: currentOwner,
      destinationOwner: newOwner,
      tokenStandard: tokenStandard,
      amount: 1,
      authorizationData: null,
    }).sendAndConfirm(umi);

    console.log(`Transfer successful: ${transactionSignature}`);
    return { success: true, data: { tx: transactionSignature } };
  } catch (error) {
    console.log(error)
    transferNFT(wallet, NFTAddress, newOwner)
  }
};

const coreSwap = async (wallet, NFTAddress, newOwner) => {
  NFTAddress = publicKey(NFTAddress);

  const umi = createUmi(connection);
  umi.use(walletAdapterIdentity(wallet));
  umi.use(mplToolbox());

  try {
    const transactionSignature = await coreNFTTransferV1(umi, {
      asset: NFTAddress,
      newOwner: newOwner,
    }).sendAndConfirm(umi);
    return { success: true, data: { tx: transactionSignature } };
  } catch (error) {
    console.log(error);
    coreSwap(wallet, NFTAddress, newOwner)
  }
};
