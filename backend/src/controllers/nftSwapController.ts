import expressAsyncHandler from "express-async-handler";
import NFTSwap, { INFTSwap, Status } from "../model/nftswap";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Request, Response } from 'express'


/**
 * Get all the proposals associated to the user
 */
const getProposal = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params
  const user = req.user

  if (id) {
    const proposed = await NFTSwap.findOne({ _id: id });
    res.status(200).json({ success: true, data: proposed })
  } else {
    const pending = await NFTSwap.find({ userId1: user.walletaddress });
    const proposed = await NFTSwap.find({ userId2: user.walletaddress })
    res.status(200).json({ success: true, data: { pending, proposed } })
  }
})


/**
 * Set the proposal pending saving data to mongoDB
 */
const setProposal = expressAsyncHandler(async (req: AuthRequest, res: Response) => {
  const { address, nfts } = req.body;
  const user = req.user;
  const proposal = new NFTSwap({ userId1: user.walletaddress, nft1: nfts, userId2: address, status: Status.Pending });
  const result = await proposal.save()
  res.status(200).json({ success: true })
})

const updateProposal = expressAsyncHandler( async (req: AuthRequest, res: Response) => {
  const {id, userId1, nft1, userId2, nft2, status} = req.body
  await NFTSwap.findOneAndUpdate({_id:id},{userId1, nft1, userId2, nft2, status:status});
  res.status(200).json({success:true})
})



export { getProposal, setProposal, updateProposal }