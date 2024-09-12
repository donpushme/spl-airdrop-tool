import { Router } from "express";
import { chunkUpload, finalUpload, loadList, transferToken } from "../controllers/airdropController"
import multer from 'multer';

const upload = multer({dest:'uploads/'})

const airdropRouter = Router()

airdropRouter.post("/upload-endpoint", upload.single('file'), chunkUpload);
airdropRouter.post("/final-upload", finalUpload);
airdropRouter.post("/loadlist", loadList);
airdropRouter.post("/transfer", transferToken);

export default airdropRouter;