import { Router } from "express";
import { getProposal, setProposal, updateProposal, updateConfirm, getConfirm, deleteProposal } from '../controllers/nftSwapController'

const nftSwapRouter = Router()

nftSwapRouter.get("/", getProposal);
nftSwapRouter.get("/:id", getProposal);
nftSwapRouter.post("/propose", setProposal);
nftSwapRouter.post("/update", updateProposal);
nftSwapRouter.post("/update-confirm", updateConfirm);
nftSwapRouter.post("/confirm", getConfirm);
nftSwapRouter.delete("/:id", deleteProposal);

export default nftSwapRouter