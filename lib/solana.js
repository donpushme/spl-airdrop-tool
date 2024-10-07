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
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
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

  try {
    const accounts = await connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID, //new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
      { filters: filters }
    );

    const tokenList = [];
    for (const cur of accounts) {
      const mint = cur.account.data.parsed.info.mint;

      try {
        const token = await getToken(mint);
        if(token.interface !== "FungibleToken") continue
        const amount = parseFloat((cur.account.data.parsed.info.tokenAmount.amount / 10 ** cur.account.data.parsed.info.tokenAmount.decimals).toFixed(5));
        tokenList.push({ mint, amount, name: token.name, symbol: token.symbol, image:token.image });
      } catch (error) {
        console.log(error);
      }
    }

    return tokenList
  }
  catch (error) {
    console.log(error)
    return []
  }
}

export const fetchUploadedFiles = async () => {

}

export const getToken = async (mint) => {
  try {
    const tokenData = await getAsset(mint);
    const token = {
      interface: tokenData.interface,
      address: mint,
      name:tokenData.content.metadata.name,
      symbol:tokenData.content.metadata.symbol,
      image:tokenData.content.links.image
    }
    console.log(token)
    return token
  } catch (error) {
    console.log(error);
    const token = {
      interface: "unknown",
      address: mint,
      name: "unknown",
      symbol: "unknown",
      image: "/token/solana.png"
    }
    return token
  }
}

export const getAsset = async (address) => {
  console.log(address)
  const response = await fetch(HELIUS_RPC, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "jsonrpc": "2.0",
      "id": "",
      "method": "getAsset",
      "params": {
        "id": address,
        "options": {
          "showUnverifiedCollections": true,
          "showCollectionMetadata": true,
          "showFungible": true,
          "showInscription": false
        }
      }
    }),
  });
  const { result } = await response.json();
  console.log("Asset: ", result);
  return result;
};

export const getOfflineMetadata = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error)
    return null
  }
}

export const checkBalance = async (publicKey, mint, SolAmount, tokenAmount) => {
  const solBalance = await getSolBalance(publicKey);
  console.log(solBalance, "SOBALANCE")
  const solFunded = solBalance >= SolAmount
  const tokenBalance = await getTokenBalance(publicKey, mint);
  console.log(tokenBalance, "TOKENBALANCE")
  const tokenFunded = tokenBalance >= tokenAmount
  return {solFunded, tokenFunded};
}

export async function getSolBalance(walletAddress) {
  try {
      // Connect to the Solana cluster
      const connection = new Connection(HELIUS_RPC, 'confirmed');
      
      console.log(walletAddress)
      // Convert the wallet address to a PublicKey
      const publicKey = new PublicKey(walletAddress);
      
      // Get the balance in lamports (1 SOL = 10^9 lamports)
      const balance = await connection.getBalance(publicKey);

      // Convert lamports to SOL
      const solBalance = balance / 1_000_000_000;

      console.log(`Wallet balance: ${solBalance} SOL`);
      return solBalance;
  } catch (error) {
      console.error("Error fetching balance:", error);
      return null;
  }
}

export async function getTokenBalance(walletAddress, tokenMintAddress) {
  // Connect to the Solana cluster (mainnet-beta, devnet, etc.)
  const connection = new Connection(HELIUS_RPC, "confirmed");

  // Convert the wallet address and token mint address to PublicKey objects
  const publicKey = new PublicKey(walletAddress);
  const tokenMint = new PublicKey(tokenMintAddress);

  // Get the associated token account address for the wallet and the given token mint
  const associatedTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      publicKey
  );

  // Fetch the account info for the associated token account
  const tokenAccountInfo = await connection.getParsedAccountInfo(associatedTokenAccount);

  // Check if the account exists and return the balance
  if (tokenAccountInfo.value) {
      const tokenAmount = tokenAccountInfo.value.data.parsed.info.tokenAmount.uiAmount;
      return tokenAmount
  } else {
      console.log("Token account does not exist.");
      return 0
  }
}