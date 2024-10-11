import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import path from 'path'
import fs from 'fs'
import { format } from "fast-csv"
import { uuid } from "../utils/generator";
import Upload from "../model/upload";
import { upload, download } from "../utils/s3";
import { AuthRequest } from "../middlewares/authMiddleware";


let chunksMap: any = {};

export const chunkUpload = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
    console.log("chunk-upload")
    const { uploadId, chunkIndex, chunk } = req.body;

    // Initialize chunks map if this is the first chunk
    if (!chunksMap[uploadId]) {
        chunksMap[uploadId] = [];
    }

    // Store the uploaded chunk in memory
    chunksMap[uploadId][chunkIndex] = chunk;

    res.status(200).json({ success: true });
})

export const finalUpload = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
    console.log("final-upload");
    const { uploadId } = req.params;
    const user = req.user;

    try {
        // Define the final CSV file path
        const randomFileName = uuid();
        const finalFilePath = path.join('uploads', `${randomFileName}.csv`);
        const writableStream = fs.createWriteStream(finalFilePath);

        // Get the chunks of objects
        const chunks = chunksMap[uploadId];

        if (chunks) {
            // Combine all chunks into a single array of objects
            const combinedData = chunks.flat(); // Flatten the array of arrays into one array

            // Initialize the CSV write stream using fast-csv
            const csvStream = format({ headers: true });

            // Pipe the CSV stream to the file
            csvStream.pipe(writableStream);

            // Write each object (row) into the CSV
            combinedData.forEach((row: any) => csvStream.write(row));

            // End the CSV stream after writing all data
            csvStream.end();

            // Clean up the chunk data in memory
            delete chunksMap[uploadId];

            // Close the writable stream
            writableStream.on("finish", async () => {
                console.log("uploading to S3", randomFileName);

                const response = await upload(`${randomFileName}.csv`);

                if (response.success) {
                    const newUpload = new Upload({
                        user: user._id as string,
                        wallet: user.walletAddress,
                        token: response.symbol,
                        type: response.type,
                        filename: randomFileName,
                        length: response.length,
                        isNft: response.isNft
                    })
                    const uploadLog = await newUpload.save();
                    console.log(uploadLog);
                    res.status(200).json({ success: true });
                } else {
                    res.status(200).json({ success: false })
                }

            });
        } else {
            throw new Error('No chunks found for this uploadId');
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "upload failed" });
    }
});