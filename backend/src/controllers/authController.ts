import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { CustomError, BadRequest } from "../errors";
import { check, validationResult } from 'express-validator';
import User, { UserRole } from '../model/user';
import { attachCookie, generateRandomNonce, uuid } from '../utils/generator';
import { validateEd25519Address, verifySignature } from '../utils/solana';
import { SIGN_MESSAGE } from "../config";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';



const getNonce = expressAsyncHandler(
    async (req: Request, res: Response): Promise<any> => {
        const { walletAddress } = req.query;
        const isValid = validateEd25519Address(walletAddress as string);
        if (!isValid) {
            console.error('[NONCE]: Wallet address is invalid');
            throw BadRequest
        }

        const user = await User.findOne({
            walletAddress,
        });
        if (user) {
            return res.json({ success: true, nonce: user.nonce });
        } else {
            return res.status(404).json({ error: 'Not found wallet address' });
        }
    })

const signUp = expressAsyncHandler(async (req: Request, res: Response): Promise<any> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        const { walletAddress } = req.body;

        const isValid = validateEd25519Address(walletAddress);
        if (!isValid) {
            return res.status(400).json({ error: 'wallet address is invalid' });
        }

        const nonce = generateRandomNonce();

        let user = await User.findOne({
            walletAddress,
        });
        if (user) {
            await User.findOneAndUpdate({ walletAddress }, { nonce });
        } else {
            const name = uuid();
            const newUser = new User({
                walletAddress,
                name,
                nonce,
            });

            await newUser.save();
        }
        return res.status(200).json({ success: true, message:`${SIGN_MESSAGE} : ${nonce}` });
    } catch (error: any) {
        console.error(error);
        throw new CustomError(500, "Internal ServerError")
    }
}
)

const signIn = expressAsyncHandler(
    async (req: Request, res: Response): Promise<any> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw BadRequest
        }

        const { walletAddress, signedMessage } = req.body;

        const isValid = validateEd25519Address(walletAddress);
        if (!isValid) {
            console.error('[SIGNIN]: Wallet address is invalid');
            throw new CustomError(400, 'Wallet address is invalid');
        }

        const user = await User.findOne({ walletAddress });

        if (!user) {
            throw new CustomError(400, 'Wallet address not found');
        }

        const valid_signature = verifySignature(
            user.walletAddress,
            user.nonce,
            signedMessage
        );
        if (!valid_signature) {
            throw new CustomError(400, 'Provided signature is invalid');
        }

        await User.findByIdAndUpdate(
            user.id,
            {
                lastLogin: new Date(),
            },
            { new: true }
        );
        const token = signedMessage + "&_&" + user.walletAddress; //This is the token with the signature and nonce of user
        res.status(200).json({ success: true, token })
    }
)



export { signUp, signIn }