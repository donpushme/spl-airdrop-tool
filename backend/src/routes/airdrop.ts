import { Router } from "express";
import { chunkUpload, finalUpload, loadList } from "../controllers/airdropController"
import multer from 'multer';

const upload = multer({dest:'uploads/'})

const airdropRouter = Router()

airdropRouter.post("/upload-endpoint", upload.single('file'), chunkUpload);
airdropRouter.post("/final-upload", finalUpload);
airdropRouter.post("/loadlist", loadList);

export default airdropRouter;