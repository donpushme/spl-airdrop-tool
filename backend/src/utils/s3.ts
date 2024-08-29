import { Upload } from "@aws-sdk/lib-storage";
import { Transform } from "stream";
import * as formidable from "formidable";
import { IncomingMessage } from "http";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";


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
  region,
});

export const upload = async () => {
  const command = new PutObjectCommand({
    Bucket: Bucket,
    Key: "hello-s3.txt",
    Body: "test text",
  });

  try {
    const response = await client.send(command);
    console.log(response);
  } catch (err) {
    console.error(err);
  }
};



