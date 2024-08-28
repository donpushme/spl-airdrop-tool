import { CustomError } from "../errors";
import fs from "fs";
import Papa from 'papaparse'

export const readListFromFile = async (dir: string) => {
  const fileType = dir.split(".")[1];
  if (fileType == 'json') {
    let data = fs.readFileSync(dir);
    data = JSON.parse(Buffer.from(data).toString())
    if (data) return data;
    else throw new CustomError(500, 'There is no data')
  } else {
    const result: any[] = [];
    const options = { header: true };
    return new Promise<any>((resolve, reject) => {
      fs.createReadStream(dir)
        .pipe(Papa.parse(Papa.NODE_STREAM_INPUT, options))
        .on("data", (data) => {
          result.push(data);
        })
        .on("end", () => {
          resolve(result);
        })
        .on('error', (error) => {
          reject(new CustomError(500, `Error reading CSV file: ${error.message}`))
        })
    })

  }
}

export const deleteFile = async (filePath:string) => {
  fs.unlinkSync(filePath);
}