import { Request, Response, NextFunction } from 'express';
import User from '../model/user';
import { CustomError } from '../errors';
import { verifySignature } from '../utils/solana';
import UnAuthenticatedError from '../errors/unAuthencitated';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            throw new UnAuthenticatedError("There is no token");
        }
        const walletAddress = token.split("&_&")[1];
        const signature = token.split("&_&")[0];
        const user = await User.findOne({ walletAddress });

        if (!user) {
            throw new UnAuthenticatedError("Authentication Failed");
        }

        const isValid = await verifySignature(walletAddress, user.nonce, signature);
        if (!isValid) throw new UnAuthenticatedError("Invalid token");

        req.user = user;
        next();
    } catch (error) {
        next(error)
    }
};
