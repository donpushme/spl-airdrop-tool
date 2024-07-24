// import { connection } from "./solana";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { TOKEN_PROGRAM, TOKEN2022_PROGRAM } from "@/config/solanaAccouts";
import { PublicKey, Connection } from "@solana/web3.js";
import { HELIUS_RPC, QUIKNODE_RPC } from "@/config";
import { getAccountInformation } from "./solana";
// import { writeFileSync } from "fs";
import fetch from "node-fetch";

export const splRouter = async (pubKey) => {
  const response =  await getTokenAccounts(pubKey);
};


const getTokenAccounts = async (pubKey) => {
  let allOwners = new Set();
  let page = 1;
  let breakPoint = 0;

  while (true) {
    let params = {
      limit: 1000,
      mint: "7atgF8KQo4wJrD5ATGX7t1V2zVvykPJbFfNeVf1icFv1",
    };

    const requests = [];

    // Make 5 concurrent requests (you can adjust this number as needed)
    for (let i = 0; i < 5; i++) {
      requests.push(
        fetch(HELIUS_RPC, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "helius-test",
            method: "getTokenAccounts",
            params: { ...params, page: page },
          }),
        })
      );
      console.log(page);
      page++;
    }

    // Wait for all requests to complete
    const responses = await Promise.all(requests);
    // console.log(responses)

    let anyDataReceived = false;

    for (const response of responses) {
      const data = await response.json();

      if (!data.result || data.result.token_accounts.length === 0) {
        console.log("No more results from one request");
        continue;
      }

      anyDataReceived = true;

      data.result.token_accounts.forEach((account) => {
        allOwners.add({owner: account.owner, balance:account.amount});
      });
    }
    console.log(allOwners.size);
    if (!anyDataReceived) {
      console.log("No more results from any request");
      breakPoint++;
    }
    if (breakPoint == 10) break;
  }

  return allOwners

  // writeFileSync("output.json", JSON.stringify(Array.from(allOwners), null, 2));
};
