import { GetObjectCommand, PutObjectCommand, S3Client, S3 } from "@aws-sdk/client-s3";
import dotenv from 'dotenv'
import fs from "fs";
import path from 'path';
import { deleteFile, getPropertiesAndValue, readListFromFile, readStrFromFile } from "./file";
import { Readable } from 'stream';
import { createWriteStream } from "fs";
dotenv.config()


// TypeScript types for environment variables
const accessKeyId = process.env.WASABI_ACCESSKEY as string;
const secretAccessKey = process.env.WASABI_SECRET as string;
const region = process.env.WASABI_REGION as string;
const Bucket = process.env.WASABI_BUCKET as string;


const client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: region,
  endpoint: "https://eu-central-2.wasabisys.com",
  forcePathStyle: true, // Optional, depending on endpoint requirements
});

export const upload = async (fileName: string) => {

  console.log("uploading fileName", fileName)

  const data = await readStrFromFile(path.join('uploads', fileName));
  const parsedData = JSON.stringify(data);

  const { properties, values, length } = await getPropertiesAndValue(path.join('uploads', fileName));
  let type = 1;
  if (!properties.includes('balance') && properties.length > 2) type = 2;

  let isNft = true;
  if(properties.includes("balance")) isNft = false

  let symbol;
  if (properties.includes("symbol")) symbol = values[2];
  else symbol = properties[1];

  const command = new PutObjectCommand({
    Bucket: Bucket,
    Key: fileName,
    Body: parsedData
  });

  try {
    const response = await client.send(command);
    deleteFile(path.join('uploads', fileName));
    return { success: true, symbol, type, length, isNft }
  } catch (err) {
    console.error(err);
    return { success: false }
  }
};

export const download = async (fileName: string) => {

  console.log("downloading ", fileName)
  const params = { Bucket, Key: fileName };

  const command = new GetObjectCommand(params);

  try {
    const response = await client.send(command);
    // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
    let str: any = await response.Body?.transformToString();
    // const arr: any = await response.Body?.transformToByteArray(); console.log(arr)

    fs.writeFileSync(path.join('uploads', fileName), JSON.parse(str));
  } catch (err) {
    console.error(err);
  }
}




