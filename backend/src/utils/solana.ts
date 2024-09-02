import nacl, { sign } from 'tweetnacl';
import bs58 from 'bs58';
import { SIGN_MESSAGE } from '../config';
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import { CONNECTION } from '../config';
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, createTransferInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { CustomError } from '../errors';
import 'dotenv/config';
import fs from 'fs'
import { readListFromFile } from './file';

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

interface Holder {
  owner: string,
  tx: string,
}

export const tokenTransfer = async (
  sender: Keypair,
  senderATA: PublicKey,
  targets: Array<Holder>,
  tokenMint: PublicKey,
  amount: number
) => {
  const successAccounts: Holder[] = []
  const transaction = new Transaction();
  targets.forEach(async (element: Holder) => {
    const receiver = new PublicKey(element.owner);

    const onCurve = PublicKey.isOnCurve(element.owner);
    if (!onCurve) return
    successAccounts.push(element)

    let receiverATA = getAssociatedTokenAddressSync(tokenMint, receiver);
    let receiverATAInfo = await connection.getAccountInfo(receiverATA);
    console.log(tokenMint.toString(), "==", receiver.toString())
    if (!receiverATAInfo) {
      const createATAInstruction = createAssociatedTokenAccountInstruction(
        sender.publicKey,
        receiverATA,
        receiver,
        tokenMint,
      );
      transaction.add(createATAInstruction);
    }

    transaction.add(
      createTransferInstruction(
        senderATA,
        receiverATA,
        sender.publicKey,
        amount
      )
    );

  });

  try {

    const res = await connection.simulateTransaction(
      transaction,
      [sender]
    );

    console.log(res)
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      sender,
    ]);

    const result: Holder[] = successAccounts.reduce((acc: Holder[], cur: Holder) => {
      acc.push({ ...cur, tx: signature });
      return acc;
    }, []);
    return result;
  } catch (error) {
    console.error("Error during token transfer:", error);
    throw error; // Re-throw to handle it outside
  }
};

interface Amount {
  amountPerEach: number, totalAmount: number
}

/**
 * This function just sends spl token from payer to target
 * @param dir File directory saving holders
 * @param payer Singer & Payer in transference
 * @param tokenMint Mint address of token to send
 * @param amount Amount of tokne to send
 */
export const startTransferToken = async (dir: string, payer: string, tokenMint: string | PublicKey, amount: Amount) => {
  console.log(dir, payer, tokenMint, amount)
  tokenMint = new PublicKey(tokenMint);
  const holders = await readListFromFile(dir);
  const sender = Keypair.fromSecretKey(bs58.decode(payer));
  // const sender = Keypair.fromSecretKey(bs58.decode("2mzxfz36nQGisfRwxj5tKTijcsNK11oXsNSGKdGnauaFRmD1KafHFsVmZdpMGHzMPB9ZNNqwhowZbrR6Yf81YUV1"));
  const senderATA = getAssociatedTokenAddressSync(tokenMint, sender.publicKey);

  const totalNum = holders.length;
  const multiNum = 1;
  const instructionNum = 6;
  let loop = Math.ceil(totalNum / multiNum);
  let index = 0;
  let totalResult: any[] = [];

  const tokenAmount = amount.amountPerEach || 100;
  while (loop > 0) {
    const request = [];
    let result = {};
    for (let i = 0; i < multiNum && index < totalNum; i++) {
      const element = holders.slice(index, index + instructionNum);
      request.push(
        new Promise(async (resolve) => {
          console.log(`sending transaction for holder ${element}`);
          const signature = await tokenTransfer(
            sender,
            senderATA,
            element,
            tokenMint,
            tokenAmount
          );
          console.log(
            `Get ${signature} from transaction for ${element.toString()}`
          );
          result = { owner: element, tx: signature };
          resolve(result);
        })
      );
      index += instructionNum;
    }
    const multiResult = await Promise.all(request);
    totalResult = [...totalResult, ...multiResult];
    loop--;
  }

  fs.writeFileSync("tx.json", JSON.stringify(totalResult, null, 2));
};

