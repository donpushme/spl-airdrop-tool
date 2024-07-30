import expressAsyncHandler from "express-async-handler";
import NFTSwap, { INFTSwap, Status } from "../model/nftswap";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Request, Response } from 'express'


/**
 * Get all the proposals associated to the user
 */
const getProposal = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user
  console.log(user)
  const pending = await NFTSwap.find({ userId1: user.id, status: Status.Pending });
  const proposed = await NFTSwap.find({ userId2: user.walletAddress, status: Status.Pending })
  res.status(200).json({ success: true, data: { pending, proposed } })
})


/**
 * Set the proposal pending saving data to mongoDB
 */
const setProposal = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { address, nfts } = req.body;
  const user = req.user;
  const proposal = new NFTSwap({ userId1: user.id, nft1: nfts, userId2: address, status: Status.Pending });
  const result = await proposal.save()
  res.status(200).json({ success: true })
})



export { getProposal, setProposal }