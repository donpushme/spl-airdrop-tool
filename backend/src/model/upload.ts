import mongoose, { Document, Schema, Model, model } from 'mongoose';

// Define the interface for the NFTSwap document
export interface IUpload extends Document {
  user?: string,
  wallet?: string,
  token?: string,
  type?: number,
  filename?: string,
  date?: Date,
  length?:number
}

// Create the schema for the NFTSwap model
const UploadSchema: Schema = new Schema({
  user: {type: String, required:true},
  wallet: { type: String, required: true },
  token: {type: String, required: true},
  type: {type: Number, required:true},
  filename: {type: String, required:true},
  length: {type: Number, required:true},
  date: { type: Date, required: true, default: Date.now }
});

// Create and export the model
const Upload: Model<IUpload> = model<IUpload>('Upload', UploadSchema);
export default Upload;