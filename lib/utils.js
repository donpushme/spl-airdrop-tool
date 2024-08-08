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
  const properties = Object.keys(exportObj[0]).join(",") + "\n";
  console.log("properties", properties);
  let data = exportObj.reduce((acc, cur, index) => {
    acc += Object.values(cur).join(",") + "\n";
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

