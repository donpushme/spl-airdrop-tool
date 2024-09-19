import { CustomError } from "../errors";
import fs from "fs";
import Papa from 'papaparse'
import csv from 'csv-parser';

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

export const readStrFromFile = async (dir: string) => {
  return new Promise((resolve, reject) => {
    const result: any[] = [];

    const readStream = fs.createReadStream(dir, { encoding: 'utf-8' });
    readStream.on('data', (chunk) => {
      result.push(chunk);
    });

    readStream.on('end', () => {
      resolve(result.join(''));
    });

    readStream.on('error', (error) => {
      reject(new CustomError(500, `Error reading CSV file: ${error.message}`));
    });
  });
}

export const deleteFile = async (filePath: string) => {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export const getPropertiesAndValue = async (filePath: string) => {
  const data = await readListFromFile(filePath);
  const properties = Object.keys(data[0]);
  const values = Object.values(data[0]);
  const length = data.length;
  return { properties, values, length }
}