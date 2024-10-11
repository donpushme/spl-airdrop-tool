import { Router } from "express";
import multer from 'multer';
import { chunkUpload, finalUpload } from "../controllers/snapshotController";

const upload = multer({dest:'uploads/'})
const snapshotRouter = Router()

snapshotRouter.post("/upload-chunk", upload.single("chunk"), chunkUpload)
snapshotRouter.post("/finalize-upload/:uploadId", finalUpload)

export default snapshotRouter;