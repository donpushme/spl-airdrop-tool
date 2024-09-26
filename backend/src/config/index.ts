import dotenv from 'dotenv'
dotenv.config()

export const MONGO_URI = process.env.MONGO_URI || ""
export const PORT = process.env.PORT || 5000;
export const JWT_SECRET = process.env.JWT_SECRET || "JWT_SECRET"
export const TOKEN_EXPIRE_TIME = process.env.TOKEN_EXPIRE_TIME || '1d';
export const SIGN_MESSAGE = process.env.SIGN_MESSAGE || 'Sign this message to authenticate your wallet';
export const CONNECTION = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';
export const FEE_PER_TRANSFER = 0.00015;