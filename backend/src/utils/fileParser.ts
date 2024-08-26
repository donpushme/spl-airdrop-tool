import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";
import { Transform } from "stream";
import * as formidable from "formidable";
import { IncomingMessage } from "http";

// TypeScript types for environment variables
const accessKeyId = process.env.WASABI_ACCESSKEY as string;
const secretAccessKey = process.env.WASABI_SECRET as string;
const region = process.env.WASABI_REGION as string;
const Bucket = process.env.WASABI_BUCKET as string;

// Define types for parsefile function arguments and return types
interface ParsedFileData {
  [key: string]: any;
}

const parsefile = async (req: IncomingMessage): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    let options: formidable.Options = {
      maxFileSize: 100 * 1024 * 1024, // 100 MBs converted to bytes
      allowEmptyFiles: false,
    };

    const form = new formidable.IncomingForm(options);

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
    });

    form.on("error", (error: Error) => {
      reject(error.message);
    });

    form.on("data", (data: any) => {
      if (data.name === "successUpload") {
        resolve(data.value);
      }
    });

    form.on("fileBegin", (formName, file :any) => {
      file.open = async function () {
        this._writeStream = new Transform({
          transform(chunk, encoding, callback) {
            callback(null, chunk);
          },
        });

        this._writeStream.on("error", (e : any) => {
          form.emit("error", e);
        });

        // upload to S3
        new Upload({
          client: new S3Client({
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
            region,
          }),
          params: {
            ACL: "public-read",
            Bucket,
            Key: `${Date.now().toString()}-${this.originalFilename}`,
            Body: this._writeStream,
          },
          tags: [], // optional tags
          queueSize: 4, // optional concurrency configuration
          partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
          leavePartsOnError: false, // optional manually handle dropped parts
        })
          .done()
          .then((data) => {
            form.emit("data", { name: "complete", value: data });
          })
          .catch((err) => {
            form.emit("error", err);
          });
      };

      file.end = function (cb: () => void) {
        this._writeStream.on("finish", () => {
          this.emit("end");
          cb();
        });
        this._writeStream.end();
      };
    });
  });
};

export default parsefile;
