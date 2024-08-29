import { GetObjectCommand, PutObjectCommand, S3Client, S3 } from "@aws-sdk/client-s3";
import dotenv from 'dotenv'
import fs from "fs";
import path from 'path';
import { deleteFile, readListFromFile } from "./file";
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
});

export const upload = async (fileName: string) => {
  console.log(region);
  console.log(Bucket);
  console.log(accessKeyId);

  const data = readListFromFile(path.join('uploads', fileName));
  const command = new PutObjectCommand({
    Bucket: Bucket,
    Key: fileName,
    Body: JSON.stringify(data)
  });

  try {
    const response = await client.send(command);
    console.log(response);
    deleteFile(path.join('uploads', fileName));
  } catch (err) {
    console.error(err);
  }
};

export const download = async (fileName: string) => {
  const params = { Bucket, Key: fileName };

  const command = new GetObjectCommand(params);

  try {
    const response = await client.send(command);
    // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
    const str: any = await response.Body?.transformToString();
    fs.writeFileSync(path.join('uploads', fileName), str);
    console.log(str);
  } catch (err) {
    console.error(err);
  }
}



