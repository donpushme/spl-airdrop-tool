import bs58 from "bs58";
import { HELIUS_RPC } from "@/config";
import { blacklistedMarketplaceOwners } from "@/config";
import { getMetadata } from "./nftSnapshot";

export const ftSnapshot = async (pubKey, min, max, walletLimit) => {
  const { symbol } = await getMetadata(pubKey);
  let numParitions = 5; // This can be adjusted based on performance needs
  let partitons = partitionAddressRange(numParitions);
  let promises = [];
  let delay = 1000; // Delay in milliseconds
  let totalNum = 0;
  walletLimit == 0 ? walletLimit = Number.MAX_SAFE_INTEGER : walletLimit;

  const delayFunction = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  for (const [i, partition] of partitons.entries()) {
    let [s, e] = partition;
    let start = bs58.encode(s);
    let end = bs58.encode(e);
    console.log(`Partition: ${i}, Start: ${start}, End: ${end}`);

    let promise = new Promise(async (resolve, reject) => {
      let owners = [];
      let current = start;
      let totalForPartition = 0;

      while (true) {
        await delayFunction(delay); // Adding delay before each request
        let response;

        try {
          response = await fetch(HELIUS_RPC, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: "my-id",
              method: "getTokenAccounts",
              params: {
                mint: pubKey,
                limit: 1000,
                after: current,
                before: end,
              },
            }),
          });

          if (!response.ok) {
            // Handle non-200 responses
            if (response.status === 429) {
              // Handle rate limiting, retry after a delay
              await delayFunction(1000); // Delay before retrying
              continue; // Retry the same request
            } else {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
          }
        } catch (error) {
          console.error("Fetch error:", error);
          reject(error); // Reject promise if there's a network error or other issue
          return;
        }

        const { result } = await response.json();
        totalForPartition += result.token_accounts.length;
        totalNum += result.token_accounts.length;
        console.log(`Found ${totalForPartition} total items in partition ${i}`);
        if (result.token_accounts.length === 0) {
          console.log(`Ended in partition ${i}`);
          break;
        } else {
          current =
            result.token_accounts[result.token_accounts.length - 1].address;
          owners.push(...result.token_accounts);
        }
        console.log("totalNum=", totalNum, "WalletLImit=", walletLimit);
        if (0 < walletLimit && walletLimit <= totalNum) {
          break;
        }
      }
      resolve(owners);
    });

    promises.push(promise);
  }

  let results = await Promise.all(promises);
  let total = results.reduce((a, b) => [...a, ...b], []);

  total = total
    .map((item) => {
      if (blacklistedMarketplaceOwners.indexOf(item.owner) < 0) {
        return { owner: item.owner, balance: item.amount, symbol };
      }
    })
    .filter(Boolean);

  if (max != 0) {
    total = total.reduce((acc, cur) => {
      if (cur.balance >= min && cur.balance <= max) {
        acc.push(cur);
      }
      return acc;
    }, []);
  } else if (max == 0) {
    total = total.reduce((acc, cur) => {
      if (cur.balance >= min) {
        acc.push(cur);
      }
      return acc;
    }, []);
  }

  return total.slice(0, walletLimit);
  // return total;
};

// Function to convert a BigInt to a byte array
function bigIntToByteArray(bigInt) {
  const bytes = [];
  let remainder = bigInt;
  while (remainder > 0n) {
    // use 0n for bigint literal
    bytes.unshift(Number(remainder & 0xffn));
    remainder >>= 8n;
  }
  while (bytes.length < 32) bytes.unshift(0); // pad with zeros to get 32 bytes
  return new Uint8Array(bytes);
}

function partitionAddressRange(numPartitions) {
  let N = BigInt(numPartitions);

  // Largest and smallest Solana addresses in integer form.
  // Solana addresses are 32 byte arrays.
  const start = 0n;
  const end = 2n ** 256n - 1n;

  // Calculate the number of partitions and partition size
  const range = end - start;
  const partitionSize = range / N;

  // Calculate partition ranges
  const partitions = [];
  for (let i = 0n; i < N; i++) {
    const s = start + i * partitionSize;
    const e = i === N - 1n ? end : s + partitionSize;
    partitions.push([bigIntToByteArray(s), bigIntToByteArray(e)]);
  }

  return partitions;
}

/**
 * Fetch the price of the given token from dexscreener
 * @param {string} pubKey
 * @returns
 */
export const getTokenPrice = async (pubKey) => {
  try {
    const response = await fetch(
      "https://api.dexscreener.io/latest/dex/tokens/" + pubKey
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.pairs && data.pairs.length > 0) {
      const price = parseFloat(data.pairs[0].priceUsd);
      return isNaN(price) ? null : price;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch price:", error);
    return null;
  }
};

export const getParams = (path) => {
  let mint, min, max, walletLimit;
  let mintSub = path.split("mint=")[1];
  let threSub = path.split("min=")[1] || "";
  walletLimit = path.split("limit=")[1] || "";

  if (threSub != "") {
    if (walletLimit != "") {
      max = threSub
        .split("max=")[1]
        .slice(0, threSub.split("max=")[1].indexOf("limit="));
      min = threSub.split("max=")[0];
    } else {
      max = threSub.split("max=")[1];
      min = threSub.split("max=")[0];
    }
  } else {
    max = "";
    min = "";
  }

  if (min != "") {
    mint = mintSub.slice(0, mintSub.indexOf("min="));
  } else if (walletLimit != "") {
    mint = mintSub.slice(0, mintSub.indexOf("limit="));
  } else mint = mintSub;

  console.log(mint, min, max, walletLimit);

  return { mint, min, max, walletLimit };
};
