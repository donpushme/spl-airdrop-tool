import { HELIUS_RPC } from "@/config";
import {
  transferV1,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { connection } from "./nftSnapshot";
import {
  createSignerFromKeypair,
  createSignerFromWalletAdapter,
  keypairIdentity,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { PublicKey } from "@solana/web3.js";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters"
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { getMetadata } from "@/lib/nftSnapshot"

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
  const nfts = items.reduce((acc, cur, index) => {
    acc.push({ id: cur.id, image: cur.content.links.image });
    return acc;
  }, []);
  return nfts;
};

export const swapNFT = async (wallet, nftToSwap, targetAddress) => {
  nftToSwap.forEach(async (nft) => {
    await transferNFT(wallet, nft.id, targetAddress);
  });
  return
};

const transferNFT = async (wallet, NFTAddress, newOwner) => {
  const {tokenStandard} = await getMetadata(NFTAddress);
  console.log("tokenStandard = ", tokenStandard);
  const umi = createUmi(connection);
  umi.use(walletAdapterIdentity(wallet))
  umi.use(mplToolbox());

  const mint = new PublicKey(NFTAddress);
  const currentOwner = wallet.publicKey;
  newOwner = new PublicKey(newOwner);

  try {
    // Execute the NFT transfer
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
  } catch (error) {
    console.error("Error transferring NFT:", error);
  }
};
