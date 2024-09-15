import { Request, Response, NextFunction } from 'express';
import User from '../model/user';
import { CustomError } from '../errors';
import { verifySignature } from '../utils/solana';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        throw new CustomError(401, "Authentication Failed");
    }
    const walletAddress = token.split("&_&")[1];
    const signature = token.split("&_&")[0];
    const user = await User.findOne({ walletAddress });

    if (!user) {
        throw new CustomError(401, "Authentication Failed");
    }

    const isValid = verifySignature(walletAddress, user.nonce, signature);
    if (!isValid) throw new CustomError(401, "Invalid token");
    req.user = user;
    next();
};
