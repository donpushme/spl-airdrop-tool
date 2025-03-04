import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const AxiosInstance = axios.create({
  baseURL: "http://localhost:5000",
});

export function downloadObjectAsJson(exportObj, exportName) {
  let dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  let downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function downloadAirdropResult(exportObj, exportName) {
  console.log("downloading airdrop result")
  const keys = Object.keys(exportObj[0]);
  const properties = keys.join(",") + "\n";
  console.log("properties", properties);
  let data = exportObj.reduce((acc, cur, index) => {
    keys.map((item) => {
      acc += cur[item] + ','
    })
    acc = acc.replace(/,$/, "\n");
    return acc;
  }, properties);
  let dataStr = "data:text/csv;charset=utf-8," + data;
  let downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".csv");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
export function downloadOwnersAsCsv(exportObj, exportName) {
  const keys = Object.keys(exportObj[0]);
  const properties = keys.join(",") + "\n";
  console.log("properties", properties);
  let data = exportObj.reduce((acc, cur, index) => {
    keys.map((item) => {
      acc += cur[item] + ','
    })
    acc = acc.replace(/,$/, "\n");
    return acc;
  }, properties);
  let dataStr = "data:text/csv;charset=utf-8," + data;
  let downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".csv");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function downloadNftAsCsv(exportObj, exportName) {
  let data = exportObj.reduce((acc, cur, index) => {
    acc += cur + "\n";
    return acc;
  }, "mint\n");
  let dataStr = "data:text/csv;charset=utf-8," + data;
  let downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".csv");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function multiplierAirdrop(
  list,
  total,
  collections,
  counts,
  multiplier,
  setTotalCounts,
  stack
) {
  console.log(
    list,
    total,
    collections,
    counts,
    multiplier,
    setTotalCounts,
    stack
  )
  total = isNaN(parseFloat(total)) ? 0 : parseFloat(total)
  let totalCount = 0;
  let newList = [];
  list.map((item) => {
    let multiple = [];
    let count = 0;
    counts.map((condition, ruleNum) => {
      if (stack) {
        multiple[ruleNum] = multiplier[ruleNum]
        let times = 99999;
        collections.map((key, index) => {
          const temp = Math.floor(item[key] / condition[index]);
          if (temp < times) times = temp;
        })
        multiple[ruleNum] = times ? multiple[ruleNum] * times : 1
      } else {
        multiple[ruleNum] = multiplier[ruleNum]
        collections.map((key, index) => {
          if (item[key] < condition[index]) multiple[ruleNum] = 1;
        })
      }
    });
    collections.map((key, index) => {
      count += Number((item[key]))
    })
    multiple = max(multiple)
    count *= multiple;
    newList.push({ ...item, multiplier: multiple, count });
    totalCount += count;
  });

  setTotalCounts(totalCount)
  const amountPerCount = total / totalCount;
  const resultList = newList.reduce((acc, cur) => {
    const amount = amountPerCount * cur.count;
    acc.push({ ...cur, amount });
    return acc;
  }, []);

  return { amountPerCount, resultList };
}

export function getTotalCountForSimple(list, collections) {
  let count = 0;
  if (typeof list != "undefined" && collections.length > 0 && list.length > 0) {
    list.map((item, index) => {
      collections.map((key, index) => {
        count += Number((item[key]))
      })
    })
  } else {
    count = list.length;
  }
  return count;
}

export function getTotalCountForFt(list, balanceAirdrop) {
  let count = 0;
  if (balanceAirdrop) {
    list.map((item, index) => {
      count += Number(item.balance)
    })
  } else {
    count = list.length
  }
  return count
}

export function ftAridrop(list, totalAmount, totalCounts, balanceAirdrop) {
  console.log({ totalAmount, totalCounts, balanceAirdrop })
  const amountPerEach = totalAmount / totalCounts;
  console.log({ amountPerEach })
  const result = list.reduce((acc, cur) => {
    let amount = 0
    if (balanceAirdrop) {
      amount = cur.balance * amountPerEach
    } else amount = amountPerEach
    acc.push({ ...cur, amount });
    return acc;
  }, []);
  return result;

}

export function simpleAirdrop(list, totalAmount, totalCounts, collections) {
  const amountPerEach = totalAmount / totalCounts;
  const result = list.reduce((acc, cur) => {
    let amount = 0
    if (collections.length > 0) {
      amount = collections.reduce((sum, key, index) => {
        sum += Number(cur[key]);
        return sum * amountPerEach
      }, 0)
    } else amount = amountPerEach
    acc.push({ ...cur, amount });
    return acc;
  }, []);
  return result;
}

export function makeURLwithMultiplier(path, counts, multiplier, totalAmount) {
  if (counts.length == 0) return;
  const stringArray = counts.map((count, index) => { return count.join("_") });
  let head = path;
  if (path.indexOf("&counts=") > 0) {
    head = path.split("&counts=")[0];
  } else if (path.indexOf("&amount=") > 0) {
    head = path.split("&amount=")[0];
  }
  let result = `${head}&counts=${stringArray.join("-")}&multiplier=${multiplier.join("-")}&amount=${totalAmount}`;
  return result;
}

export function removeCountsfromUrl(path) {
  let head = path;
  let back = "";
  if (path.indexOf("&counts=") > 0) {
    head = path.split("&counts=")[0];
    back = path.split("&counts=")[1].slice(path.split("&counts=")[1].indexOf("&amount"))
  }
  return `${head}${back}`;
}

export function makeURLwithAmount(path, totalAmount) {
  if (totalAmount == 0 || totalAmount == "") return path.split("&amount=")[0]
  let head = path;
  if (path.indexOf("&amount=") > 0) {
    head = path.split("&amount=")[0];
  }
  if (totalAmount == 0 || typeof totalAmount == "undefined") return `${head}`
  return `${head}&amount=${totalAmount}`;
}

export function makeURLwithFile(path, fileId) {
  let head = path;
  let back = "";
  if (path.indexOf("&file=") > 0) {
    head = path.split("&file=")[0];
    back = path.split("&file=")[1].indexOf("&") > 0 ? path.split("&file=")[1].slice(path.split("&file=")[1].indexOf("&")) : ""
  } else if (path.indexOf("&address=") > 0) {
    head = path.split("&address=")[0];
    back = path.slice(path.indexOf("&address="));
  } else if (path.indexOf("&counts=") > 0) {
    head = path.split("&counts=")[0];
    back = path.slice(path.indexOf("&counts="));
  } else if (path.indexOf("&amount=") > 0) {
    head = path.split("&amount=")[0];
    back = path.slice(path.indexOf("&amount="));
  }
  if (fileId == "" || typeof fileId == "undefined") return `${head}${back}`
  return `${head}&file=${fileId}${back}`;
}

export function makeURLwithAddress(path, address) {
  let head = path;
  let back = "";
  if (path.indexOf("&address=") > 0) {
    head = path.split("&address=")[0];
    back = path.split("&address=")[1].indexOf("&") > 0 ? path.split("&address=")[1].slice(path.split("&address=")[1].indexOf("&")) : ""
  } else if (path.indexOf("&counts=") > 0) {
    head = path.split("&counts=")[0];
    back = path.slice(path.indexOf("&counts="));
  } else if (path.indexOf("&amount=") > 0) {
    head = path.split("&amount=")[0];
    back = path.slice(path.indexOf("&amount="));
  }
  if (address.length > 0) return `${head}&address=${address}${back}`;
  else return `${head}${back}`;
}

export function getParams(path) {
  let fileId = "";
  let address = "";
  let counts = [[]];
  let multiplier = [1];
  let totalAmount = 0;
  let flag = 1;
  let ruleLen = 1;

  //get file
  if (path.indexOf("&file=") > 0) {
    fileId = path.split("&file=")[1]
      ? path.split("&file=")[1].indexOf("&") > 0 ? path.split("&file=")[1].slice(0, path.split("&file=")[1].indexOf("&")) : path.split("&file=")[1].slice(0)
      : "";
    flag *= 0;
  }

  totalAmount = path.split("&amount=")[1];

  //get counts
  let countsIndex = path.indexOf("&counts=");
  if (path.indexOf("&counts=") > 0) {
    const tailString = path.split("&counts=")[1];
    const multiplierIndex = tailString.indexOf("&multiplier=");
    const countsString = tailString.slice(0, multiplierIndex);

    let semi_counts = countsString.split("-");
    counts = semi_counts.map((item) => {
      return item.split("_");
    })
    const amountIndex = tailString.split("&multiplier=")[1].indexOf("&amount=");
    multiplier = tailString.split("&multiplier=")[1].slice(0, amountIndex).split("-");
    flag *= 0;
  }

  if (path.indexOf("&address=") > 0) {
    const subString = path.split("&address=")[1];
    const endIndex = subString.indexOf("&");
    address = endIndex > 0 ? subString.slice(0, endIndex) : subString
    flag *= 0;
  }

  ruleLen = multiplier.length

  return { flag, fileId, address, counts, multiplier, totalAmount, ruleLen };
}

export const sortList = (list, sortBy, type) => {
  if (type) list.sort((a, b) => {
    if (!isNaN(a[sortBy])) return a[sortBy] - b[sortBy]
    else return new Date(a[sortBy]) - new Date(b[sortBy])
  });
  else list.sort((a, b) => {
    if (!isNaN(a[sortBy])) return b[sortBy] - a[sortBy]
    else return new Date(b[sortBy]) - new Date(a[sortBy])
  });

  return list
}

export function max(value) {
  let max = value[0]
  for (let x of value) {
    if (x > max) max = x;
  }

  return max;
}


