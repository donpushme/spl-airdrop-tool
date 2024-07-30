import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import fs from "fs"
import { uuid } from "../utils/generator";
import path from 'path';
import { CustomError, BadRequest } from "../errors";
import Papa from 'papaparse'
import { tokenTransfer } from "../utils/solana";

/**
 * This is for saving big list file by chunk
 */
const chunkUpload = expressAsyncHandler(async (req: Request, res: Response) => {
  const chunk = req.file as Express.Multer.File;
  const uploadId = req.headers['x-upload-id'] as string;
  const chunkIndex = req.headers['x-chunk-index'] as string;
  const destinationPath = path.join('uploads', uploadId);

  if (!fs.existsSync(destinationPath)) {
    fs.mkdirSync(destinationPath);
  }

  const chunkDestination = path.join(destinationPath, `${chunkIndex}.chunk`);
  fs.rename(chunk.path, chunkDestination, (err) => {
    if (err) {
      throw new CustomError(500, 'Error saving chunk');
    }
    res.send('Chunk uploaded successfully');
  });
})


/**
 * Finalize saving by chunk and returns the filename and extension
 * @param req 
 * @param res 
 */
const finalUpload = (req: Request, res: Response) => {
  const { uploadId, fileType } = req.body;
  const destinationPath = path.join('uploads', uploadId);
  const randomFileName = uuid(); // Randomly generated file name with .data extension
  const finalFilePath = path.join('uploads', `${randomFileName}.${fileType}`);

  const writeStream = fs.createWriteStream(finalFilePath);
  const chunks = fs.readdirSync(destinationPath).sort();

  chunks.forEach(chunk => {
    const chunkPath = path.join(destinationPath, chunk);
    const data = fs.readFileSync(chunkPath);
    writeStream.write(data);
    fs.unlinkSync(chunkPath); // Remove chunk after writing
  });

  writeStream.end(() => {
    fs.rmdirSync(destinationPath);
    res.status(200).json({ success: true, message: 'File upload complete', fileName: randomFileName, fileType });
  });
}

/**
 * Load the list with the filename and extension
 * @param req 
 * @param res 
 */
const loadList = expressAsyncHandler(async (req: Request, res: Response) => {
  const { page, perPage } = req.body;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const { fileName, fileType } = req.body;
  const dir = `uploads\\${fileName}.${fileType}`
  console.log(dir)
  const data = await readListFromFile(dir);

  const paginatedData = data.slice(start, end);

  if (data) res.status(200).json({ paginatedData })
  else throw new CustomError(500, 'Reading file error')
})

const readListFromFile = async (dir: string) => {
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

const transferToken = expressAsyncHandler(async (req: Request, res: Response) => {
  const { fileName, fileType, tokenMint, wallet, amount } = req.body
  const dir = `uploads/${fileName}.${fileType}`
  console.log(dir, wallet)
  const list = await readListFromFile(dir)
  console.log(list)
  // list.map((item:any, index:number) => {
  //   tokenTransfer(wallet, item, tokenMint, amount.amountPerEach)
  // })
  res.status(200).json({success:true})
})

export { chunkUpload, finalUpload, loadList, transferToken }