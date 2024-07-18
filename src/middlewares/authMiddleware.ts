import { Request, Response, NextFunction } from 'express';
import User from '../model/user';
import { CustomError } from '../errors';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(req.headers)

    if (!token) {
        throw new CustomError(401, "Authentication Failed");
    }

    try {
        const decodedToken = User.verifyToken(token); // This returns the decoded token payload
        const user = decodedToken.user

        if (!user) {
            throw new CustomError(401, "Authentication Failed");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new CustomError(400, "Invalid token");
    }
};
