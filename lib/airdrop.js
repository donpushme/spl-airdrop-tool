import bs58 from 'bs58';
import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, createTransferInstruction } from "@solana/spl-token";
import { connection } from './nftSnapshot';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const tokenTransfer = async (
  sender,
  senderATA,
  targets,
  tokenMint,
  decimal
) => {
  const successAccounts = [];
  const failedAccounts = [];
  const successTx = [];
  const transaction = new Transaction();
  targets.forEach(async (element) => {
    const receiver = new PublicKey(element.owner);
    const amount = parseFloat(element.amount);
    const onCurve = PublicKey.isOnCurve(element.owner);
    if (amount <= 0 || !onCurve) {
      failedAccounts.push(element)
      return
    }
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
        Math.floor(amount * 10 ** decimal)
      )
    );
  });
  let retry = 0
  while (retry < 2) {
    try {
      const res = await connection.simulateTransaction(transaction, [sender]);

      console.log(res);
      const signature = await sendAndConfirmTransaction(connection, transaction, [
        sender,
      ]);

      successAccounts?.map((cur) => {
        successTx.push({ ...cur, tx: signature });
      }, []);
      break;
    } catch (error) {
      console.error("Error during token transfer:", error);
      retry++;
    }
  }
  if(successTx.length == 0 || typeof successTx == "undefined") {
    const result = targets?.map((cur) => {
      return { ...cur, tx: "failed" }
    })
    console.log({result});
    return result;
  }
  const failedTx = failedAccounts?.map((cur) => {
    return { ...cur, tx: "failed" }
  })
  const result = [...successTx, ...failedTx]
  console.log({ result })
  return result;
};

/**
 * This function just sends spl token from payer to target
 * @param dir File directory saving holders
 * @param payer Singer & Payer in transference
 * @param tokenMint Mint address of token to send
 * @param amount Amount of tokne to send
 */
export const startTransferToken = async (holders, payer, token, setList) => {
  const tokenMint = new PublicKey(token.address);
  const decimal = token.decimal
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
            decimal
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

export const judgeResult = (list) => {
  if (typeof list[0]?.tx == "undefined") return { success: 0, failed: 0 }
  let success = 0, failed = 0;
  list.map((item, index) => {
    if (item.tx == "failed") failed++;
    else success++;
  });;
  return { success, failed }
}
