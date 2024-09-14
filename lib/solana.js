import { HELIUS_RPC, QUIKNODE_RPC } from "@/config";
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
import { Connection, GetProgramAccountsFilter } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import bs58 from "bs58";

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
    if (nft.interface == "MplCoreAsset") {
      response = await coreSwap(wallet, nft.id, targetAddress);
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
    console.log(error);
    transferNFT(wallet, NFTAddress, newOwner);
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
    coreSwap(wallet, NFTAddress, newOwner);
  }
};

export const isValidSolanaAddress = (address) => {
  const decoded = bs58.decode(address);
  return decoded.length === 32; // Solana public key is 32 bytes
};

export const fetchWalletTokens = async (wallet) => {
  const connection = new Connection(QUIKNODE_RPC);
  const filters = [
    {
      dataSize: 165,    //size of account (bytes)
    },
    {
      memcmp: {
        offset: 32,     //location of our query in the account (bytes)
        bytes: wallet,  //our search criteria, a base58 encoded string
      },
    }];
  const accounts = await connection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID, //new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    { filters: filters }
  );

  console.log(accounts)

  const tokenList = [];
  for (const cur of accounts) {
    const mint = cur.account.data.parsed.info.mint;
    console.log(mint);

    try {
      const metadata = await getMetadata(mint);
      if (metadata.model == "nft") continue;
      const { image } = await fetch(metadata.uri)
        .then((response) => response.json()) // assuming the response is in JSON format
        .catch((error) => {
          console.log(error);
          return {}; // Return an empty object or handle the error appropriately
        });
      const amount = parseFloat((cur.account.data.parsed.info.tokenAmount.amount / 10 ** cur.account.data.parsed.info.tokenAmount.decimals).toFixed(5));
      tokenList.push({ mint, amount, name: metadata.name, symbol: metadata.symbol, image });
    } catch (error) {
      console.log(error);
    }
  }

  return tokenList
}

export const fetchUploadedFiles = async () => {

}