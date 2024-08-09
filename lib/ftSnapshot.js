import bs58 from "bs58";
import { HELIUS_RPC } from "@/config";
import { blacklistedMarketplaceOwners } from "@/config";

export const ftSnapshot = async (pubKey, min, max) => {
  let numParitions = 5; // This can be adjusted based on performance needs
  let partitons = partitionAddressRange(numParitions);
  let promises = [];
  let delay = 1000; // Delay in milliseconds

  const delayFunction = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

        const response = await fetch(HELIUS_RPC, {
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
        const { result } = await response.json();
        totalForPartition += result.token_accounts.length;
        console.log(`Found ${totalForPartition} total items in partition ${i}`);
        if (result.token_accounts.length == 0) {
          console.log(`Ended in partition ${i}`);
          break;
        } else {
          current =
            result.token_accounts[result.token_accounts.length - 1].address;
          owners = [...owners, ...result.token_accounts];
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
        return { owner: item.owner, balance: item.amount };
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
  
  return total;
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
      return null
    }

    const data = await response.json();
    if (data.pairs && data.pairs.length > 0) {
      const price = parseFloat(data.pairs[0].priceUsd);
      return isNaN(price) ? null : price;
    } else {
      return null
    }
  } catch (error) {
    console.error("Failed to fetch price:", error);
    return null;
  }
};
