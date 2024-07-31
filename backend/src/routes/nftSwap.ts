import { Router } from "express";
import { getProposal, setProposal,updateProposal} from '../controllers/nftSwapController'

const nftSwapRouter =  Router()

nftSwapRouter.get("/", getProposal);
nftSwapRouter.get("/:id", getProposal);
nftSwapRouter.post("/propose", setProposal);
nftSwapRouter.post("/update", updateProposal);

export default nftSwapRouter