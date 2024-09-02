import AWS from 'aws-sdk';
import dotenv from 'dotenv'
import fs from "fs";
import path from 'path';
import { deleteFile, readListFromFile } from "./file";
import { CustomError } from '../errors';
dotenv.config();



// TypeScript types for environment variables
const accessKeyId = process.env.WASABI_ACCESSKEY as string;
const secretAccessKey = process.env.WASABI_SECRET as string;
const region = process.env.WASABI_REGION as string;
const Bucket = process.env.WASABI_BUCKET as string;

AWS.config.update({
  region: 'eu-central-2',
  credentials: new AWS.Credentials(accessKeyId, secretAccessKey)
});

const client = new AWS.S3({
  endpoint: 'https://eu-central-2.wasabisys.com'
});

export const upload = async (fileName: string) => {

  const data = await readListFromFile(path.join('uploads', fileName));
  console.log("data==================>", data);
  const uploadParams = {
    Bucket: Bucket,
    Key: fileName,
    Body: JSON.stringify(data),
  };

  try {
    client.upload(uploadParams, (err: any, data: any) => {
      if (err) {
        console.error(err);
        throw new CustomError(500, "Upload failed")
      }
      console.log(data);
      deleteFile(path.join('uploads', fileName));
      return ({ msg: "Successfully uploaded" })
    });
  } catch (err) {
    console.error(err);
    return ({error: "Upload faild"})
  }
};

export const download = async (fileName: string) => {
  const params = { Bucket, Key: fileName };


  try {
    var file = require('fs').createWriteStream(path.join('upload', fileName));
    await client.getObject(params).createReadStream().pipe(file);
    return ({msg: "Successfully uploaded"})
  } catch (err) {
    console.error(err);
    return ({error:"Download faild"})
  }
}



