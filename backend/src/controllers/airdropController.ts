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
import { upload, download } from "../utils/s3";
import { deleteFile } from "../utils/file";
import Upload, { IUpload } from "../model/upload";
import mongoose from "mongoose";
// import { download } from "../utils/s3-v2";
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
const finalUpload = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;
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
    console.log("uploading to S3");

    const response = await upload(`${randomFileName}.csv`);

    console.log(user);
    if (response.success) {
      const newUpload = new Upload({
        user: user._id as string,
        wallet: user.walletAddress,
        token: response.symbol,
        type: response.type,
        filename: randomFileName,
      })
      const uploadLog = await newUpload.save();
      console.log("db saved", uploadLog)
      res.status(200).json({ success: true, message: 'File upload complete', fileId: uploadLog._id });
    } else {
      res.status(500).json({ success: false, message: 'File upload failed' });
    }
  });
})

/**
 * Load the list with the filename and extension
 * @param req 
 * @param res 
 */


const loadList = expressAsyncHandler(async (req: Request, res: Response) => {
  const { fileId, page, perPage, isBeginning, isFinal } = req.body;

  // Validate inputs
  if (!fileId || !page || !perPage) {
    throw new CustomError(400, "Invalid input: fileId, page, and perPage are required.");
  }

  const start = (page - 1) * perPage;
  const end = start + perPage;
  console.log("fileId:", fileId);

  let fileName: string | undefined;

  try {
    // Check if fileId is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      throw new CustomError(400, "Invalid fileId format.");
    }

    // Fetch the file record from the database
    const log = await Upload.findById(new mongoose.Types.ObjectId(fileId));
    console.log("log:", log);

    if (!log) {
      throw new CustomError(404, "File not found.");
    }

    fileName = log.filename;
  } catch (error) {
    console.error("Error fetching file:", error);
    throw new CustomError(500, "Error fetching the file record.");
  }

  if (!fileName) {
    throw new CustomError(404, "There isn't such a file uploaded.");
  }

  const dir = path.join("uploads", `${fileName}.csv`);

  // Handle final flag (delete file)
  if (isFinal) {
    console.log("Deleting file")
    try {
      await deleteFile(dir);
      res.status(200).json({ success: true, message: "File deleted successfully." });
    } catch (error) {
      console.error("Error deleting file:", error);
      throw new CustomError(500, "Error deleting the file.");
    }
  }

  // Handle beginning flag (download file)
  if (isBeginning) {
    try {
      await download(`${fileName}.csv`);
    } catch (error) {
      console.error("Error downloading file:", error);
      throw new CustomError(500, "Error downloading the file.");
    }
  }

  // Read paginated data from file
  try {
    const data = await readListFromFile(dir);
    const paginatedData = data.slice(start, end);
    res.status(200).json({ paginatedData });
  } catch (error) {
    console.error("Error reading data from file:", error);
    throw new CustomError(500, "Error reading the file.");
  }
});

export default loadList;


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

const getUploadLogs =expressAsyncHandler (async (req:AuthRequest, res: Response)=> {
  const user = req.user
  const logs = await Upload.find({username:user.id});
  if(logs) res.status(200).json({success:true, data:logs});
})

export { chunkUpload, finalUpload, loadList, transferToken, getUploadLogs }