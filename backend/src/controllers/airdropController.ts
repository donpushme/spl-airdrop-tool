import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import  fs from "fs"
import { uuid } from "../utils/generator";
import path from 'path';


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
      return res.status(500).send('Error saving chunk');
    }
    res.send('Chunk uploaded successfully');
  });
})


/**
 * Finalize saving by chunk and returns the filename and extension
 * @param req 
 * @param res 
 */
const finalUpload = (req:Request, res:Response) => {
  const { uploadId, filetype } = req.body;
  const destinationPath = path.join('uploads', uploadId);
  const randomFileName = uuid(); // Randomly generated file name with .data extension
  const finalFilePath = path.join('uploads', `${randomFileName}.${filetype}`);

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
    res.status(200).json({ success:true, message: 'File upload complete', fileName: randomFileName, filetype });
  });
}

/**
 * Load the list with the filename and extension
 */
const loadList = (req:Request, res:Response) => {
  const {fileName, fileType} = req.body;
  const list = fs.readFileSync(`uploads\\${fileName}.${fileType}`);
  console.log(list)
}

export { chunkUpload, finalUpload, loadList }