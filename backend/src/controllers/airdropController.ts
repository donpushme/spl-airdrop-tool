import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import fs from "fs"
import { uuid } from "../utils/generator";
import path from 'path';
import { CustomError, BadRequest } from "../errors";
import { readListFromFile } from "../utils/file";
import { startTransferToken } from "../utils/solana";
import Airdrop, { IAirdrop } from "../model/airdrop";
import { AuthRequest } from "../middlewares/authMiddleware";
import { upload } from "../utils/s3";
// import { uploadFiletoS3 } from "../utils/S3";

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
const finalUpload = expressAsyncHandler( async (req: Request, res: Response) => {
  const { uploadId, fileType } = req.body;
  const destinationPath = path.join('uploads', uploadId);
  const randomFileName = uuid(); // Randomly generated file name with .data extension
  const finalFilePath = path.join('uploads', `${randomFileName}.csv`);

  const writeStream = fs.createWriteStream(finalFilePath);
  const chunks = fs.readdirSync(destinationPath).sort();

  chunks.forEach(chunk => {
    const chunkPath = path.join(destinationPath, chunk);
    const data = fs.readFileSync(chunkPath);
    writeStream.write(data);
    fs.unlinkSync(chunkPath); // Remove chunk after writing
  });

  
  writeStream.end(async () => {
    fs.rmdirSync(destinationPath);
    const response = await upload(`${randomFileName}.csv`);
    console.log(response)
    res.status(200).json({ success: true, message: 'File upload complete', fileName: randomFileName, fileType });
  });
})

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
  const dir = path.join(`uploads`,`${fileName}.csv`);
  const data = await readListFromFile(dir);

  const paginatedData = data.slice(start, end);

  if (data) res.status(200).json({ paginatedData })
  else throw new CustomError(500, 'Reading file error')
})

const transferToken = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  const { fileName, fileType, tokenMint, wallet, amount } = req.body
  const newAirdrop = new Airdrop({ user: user.id, wallet: wallet, token: tokenMint });
  const airdrop = await newAirdrop.save();
  if (airdrop) {
    const dir = path.join(`uploads`, `${fileName}.${fileType}`)
    startTransferToken(dir, wallet, tokenMint, amount)
    res.status(200).json({ success: true })
  } else {
    throw new CustomError(500, 'Internal Server Error')
  }

})

const uploadToS3 = expressAsyncHandler(async (req: Request, res: Response) => {
  const result = await upload();
  res.status(200).json({result})
})

export { chunkUpload, finalUpload, loadList, transferToken, uploadToS3 }