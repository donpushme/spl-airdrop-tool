import bs58 from 'bs58';
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, createTransferInstruction} from "@solana/spl-token";
import { connection } from './nftSnapshot';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const tokenTransfer = async (
  sender,
  senderATA,
  targets,
  tokenMint,
) => {
  const successAccounts = [];
  const transaction = new Transaction();
  targets.forEach(async (element) => {
    const receiver = new PublicKey(element.owner);
    const amount = Math.floor(Number(element.amount))
    const onCurve = PublicKey.isOnCurve(element.owner);
    if (!onCurve) return;
    successAccounts.push(element);

    let receiverATA = getAssociatedTokenAddressSync(tokenMint, receiver);
    let receiverATAInfo = await connection.getAccountInfo(receiverATA);
    console.log(tokenMint.toString(), "==", receiver.toString());
    if (!receiverATAInfo) {
      const createATAInstruction = createAssociatedTokenAccountInstruction(
        sender.publicKey,
        receiverATA,
        receiver,
        tokenMint
      );
      transaction.add(createATAInstruction);
    }

    transaction.add(
      createTransferInstruction(
        senderATA,
        receiverATA,
        sender.publicKey,
        amount * LAMPORTS_PER_SOL
      )
    );
  });

  try {
    const res = await connection.simulateTransaction(transaction, [sender]);

    console.log(res);
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      sender,
    ]);

    const result = successAccounts.reduce((acc, cur) => {
      acc.push({ ...cur, tx: signature });
      return acc;
    }, []);
    return result;
  } catch (error) {
    console.error("Error during token transfer:", error);
    throw error; // Re-throw to handle it outside
  }
};

/**
 * This function just sends spl token from payer to target
 * @param dir File directory saving holders
 * @param payer Singer & Payer in transference
 * @param tokenMint Mint address of token to send
 * @param amount Amount of tokne to send
 */
export const startTransferToken = async (holders, payer, tokenMint, setList) => {
  tokenMint = new PublicKey(tokenMint);
  const sender = Keypair.fromSecretKey(bs58.decode(payer));
  // const sender = Keypair.fromSecretKey(bs58.decode("9J7hgrSmrwm7qe1CfaWbKrCzhcWvvWDLsoer4yjTv8LYKGazq5ASPtNntpbFXL2gF5F3uN8EoctYesbnoKdsTDY"));
  const senderATA = getAssociatedTokenAddressSync(tokenMint, sender.publicKey);
  console.log("Sender ATA:", senderATA);

  const totalNum = holders.length;
  const multiNum = 1;
  const instructionNum = 6;
  let loop = Math.ceil(totalNum / multiNum);
  let index = 0;
  let totalResult = [];

  while (loop > 0) {
    const request = [];
    let result = {};
    for (let i = 0; i < multiNum && index < totalNum; i++) {
      const elements = holders.slice(index, index + instructionNum);
      request.push(
        new Promise(async (resolve) => {
          console.log(`sending transaction for holder ${elements}`);
          const signatures = await tokenTransfer(
            sender,
            senderATA,
            elements,
            tokenMint,
          );
          result = signatures;
          resolve(result);
        })
      );
      index += instructionNum;
    }
    const multiResult = await Promise.all(request);
    const flatten = multiResult.flat()
    totalResult.push(flatten);
    totalResult = totalResult.flat();
    setList(totalResult);
    loop--;
  }
  const result = totalResult.flat();
};
