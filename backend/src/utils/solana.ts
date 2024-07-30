import nacl, { sign } from 'tweetnacl';
import bs58 from 'bs58';
import { SIGN_MESSAGE } from '../config';
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import { CONNECTION } from '../config';
import { getOrCreateAssociatedTokenAccount, mintTo, transfer } from "@solana/spl-token";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import { CustomError } from '../errors';
import 'dotenv/config';

export const connection = new Connection(CONNECTION, 'confirmed');

export const validateEd25519Address = (address: string) => {
  try {
    const isValidAddress = PublicKey.isOnCurve(address);
    if (isValidAddress) return true;
    else return false;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const verifySignature = (
  address: string,
  nonce: string | undefined,
  signature: string
) => {
  try {
    const message = `${SIGN_MESSAGE} : ${nonce}`;
    return sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(address)
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getPrice = async (pubKey: string): Promise<number | null> => {
  interface Pair {
    priceUsd: string;
  }

  interface Data {
    pairs: Pair[];
  }

  try {
    const response = await fetch(
      'https://api.dexscreener.io/latest/dex/tokens/' + pubKey
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: Data = await response.json();
    if (data.pairs && data.pairs.length > 0) {
      const price = parseFloat(data.pairs[0].priceUsd);
      return isNaN(price) ? null : price;
    } else {
      throw new Error('No pairs data found');
    }
  } catch (error) {
    console.error('Failed to fetch price:', error);
    return null;
  }
};


/**
 * This function just sends spl token from payer to target
 * @param payer Singer & Payer in transference
 * @param target Reciever's address
 * @param tokenMint Mint address of token to send
 * @param amount Amount of tokne to send
 */
export const tokenTransfer = async (payer:string, target:string, tokenMint:string | any, amount:number) => {
  const sender = Keypair.fromSecretKey(bs58.decode(payer));
  const receiver = new PublicKey(target);
  tokenMint = new PublicKey(tokenMint);

  const receiverATA = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    tokenMint,
    receiver
  );

  
  const senderATA = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    tokenMint,
    sender.publicKey
  );
  

  try {
    const signature = await transfer(
      connection,
      sender,
      senderATA.address,
      receiverATA.address,
      sender.publicKey,
      amount
    );
    console.log(signature)
  } catch (error) {
    throw new CustomError(500, "Transfer error");
  }
};

