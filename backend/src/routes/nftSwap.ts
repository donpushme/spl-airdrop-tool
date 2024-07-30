import { Router } from "express";
import { getProposal, setProposal} from '../controllers/nftSwapController'

const nftSwapRouter =  Router()

nftSwapRouter.get("/", getProposal);
nftSwapRouter.post("/propose", setProposal);

export default nftSwapRouter