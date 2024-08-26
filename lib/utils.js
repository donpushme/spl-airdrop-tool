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

export function downloadOwnersAsCsv(exportObj, exportName) {
  const keys = Object.keys(exportObj[0]);
  const properties = keys.join(",") + "\n";
  console.log("properties", properties);
  let data = exportObj.reduce((acc, cur, index) => {
    keys.map((item) => {
      acc += cur[item] + ','
    })
    acc = acc.replace(/,$/,"\n");
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
  setTotalCounts
) {
  total = isNaN(parseFloat(total)) ? 0 : parseFloat(total)
  let totalCount = 0;
  let newList = [];
  list.map((item) => {
    let multiple = multiplier;
    let count = 0;
    collections.map((key, index) => {
      if (item[key] < counts[index]) multiple = 1;
      count += Number((item[key]))
    });
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

export function simpleAirdrop(list, totalAmount) {
  const amountPerEach = totalAmount / list.length;
  const result = list.reduce((acc, cur) => {
    acc.push({ ...cur, amount: amountPerEach });
    return acc;
  }, []);
  return result;
}

export function makeURLwithMultiplier(path, counts, multiplier, totalAmount) {
  const countsString = counts.length > 0 ? counts.join("_") : "";
  let head = path;
  if (path.indexOf("&counts=") > 0) {
    head = path.split("&counts=")[0];
  } else if (path.indexOf("&amount=") > 0) {
    head = path.split("&amount=")[0];
  }
  return `${head}&counts=${countsString}&multiplier=${multiplier}&amount=${totalAmount}`;
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
  if(totalAmount == 0 || totalAmount == "") return path.split("&amount=")[0]
  let head = path;
  if (path.indexOf("&amount=") > 0) {
    head = path.split("&amount=")[0];
  }
  return `${head}&amount=${totalAmount}`;
}

export function makeURLwithFile(path, fileName, fileType) {
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
  return `${head}&file=${fileName}${fileType[0]}${back}`;
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

  return `${head}&address=${address}${back}`;
}

export function getParams(path) {
  let fileName = "";
  let fileType = "";
  let address = "";
  let counts = [];
  let multiplier = 1;
  let totalAmount = 0;
  let flag = 1;

  //get file
  if (path.indexOf("&file=") > 0) {
    fileName = path.split("&file=")[1]
      ? path.split("&file=")[1].slice(0, 16)
      : "";
    fileType = path.split("&file=")[1]
      ? path.split("&file=")[1].slice(16, 17)
      : "";
    fileType = fileType == "j" ? "json" : "csv";
    flag *= 0;
  }

  //get counts
  let countsIndex = path.indexOf("&counts=");
  if (path.indexOf("&counts=") > 0) {
    const tailString = path.split("&counts=")[1];
    totalAmount = tailString.split("&amount=")[1];
    const multiplierIndex = tailString.indexOf("&multiplier=");
    const countsString = tailString.slice(0, multiplierIndex);
    counts = countsString.split("_");
    const amountIndex = tailString.split("&multiplier=")[1].indexOf("&amount=");
    multiplier = tailString.split("&multiplier=")[1].slice(0, amountIndex);
    flag *= 0;
  }

  if (path.indexOf("&address=") > 0) {
      const subString = path.split("&address=")[1];
      const endIndex = subString.indexOf("&");
      address = endIndex > 0 ? subString.slice(0, endIndex) : subString
    flag *= 0;
  }

  return { flag, fileName, fileType, address, counts, multiplier, totalAmount };
}

export const sortList = (list, sortBy, type) => {
  if(type)  list.sort((a, b) => {return a[sortBy] - b[sortBy]});
  else list.sort((a, b) => {return b[sortBy] - a[sortBy]});

  return list
}
