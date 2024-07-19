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
  name: string,
  role: number,
  nonce?:string,
  lastLogin?:Date,
  deletedAt?:Date,
  createJWT(): string;
}

export interface IUserModel extends Model<IUser> {
  verifyToken(token: string): any;
}

const UserSchema : Schema<IUser> = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nonce: { type: String, required: true },
  role: { type: Number, required: true, default: UserRole.User },
  lastLogin: { type: Date, required: true, default: Date.now },
  deletedAt: { type: Date, required: false },
});

UserSchema.methods.createJWT = function (): string | any {
  const payload : any = {
    user: {
      id: this.id,
      walletaddress: this.walletAddress,
      name: this.name,
      role: this.role,
    },
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

UserSchema.statics.verifyToken = function (token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err: any) {
    throw new CustomError(400, err.message || 'Invalid Token');
  }
};

const User: IUserModel = model<IUser, IUserModel>('User', UserSchema);

export default User;
