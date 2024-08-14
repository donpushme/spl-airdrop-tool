import mongoose from 'mongoose';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '../config';
import { CustomError } from '../errors';
import { Model, model, Schema } from 'mongoose';

export enum UserRole {
  Admin,
  User,
}
export interface IUser extends Document {
  id:string,
  walletAddress:string,
  role: number,
  nonce?:string,
  lastLogin?:Date,
}

export interface IUserModel extends Model<IUser> {
  verifyToken(token: string): any;
}

const UserSchema : Schema<IUser> = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  nonce: { type: String, required: true },
  role: { type: Number, required: true, default: UserRole.User },
  lastLogin: { type: Date, required: true, default: Date.now },
});

UserSchema.statics.verifyToken = function (token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err: any) {
    throw new CustomError(400, err.message || 'Invalid Token');
  }
};

const User: IUserModel = model<IUser, IUserModel>('User', UserSchema);

export default User;
