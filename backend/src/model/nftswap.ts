import mongoose, { Document, Schema, Model, model } from 'mongoose';

export enum Status{
  Pending,
  Accepted,
  Completed
}

// Define the interface for the NFTSwap document
export interface INFTSwap extends Document {
  userId: string;
  nft1: any[]; // Define the type more explicitly if possible
  userId2: string;
  nft2: any[]; // Define the type more explicitly if possible
  status: number;
  // date: Date
}

// Create the schema for the NFTSwap model
const NFTSwapSchema: Schema = new Schema({
  userId1: { type: String, required: true },
  nft1: { type: [Schema.Types.Mixed], required: true }, // Array of mixed types
  userId2: { type: String, required:true},
  nft2: { type: [Schema.Types.Mixed]}, // Array of mixed types
  status: {type: Number, required:true },
  // date: { type: Date, required: true, default: Date.now }
});

// Create and export the model
const NFTSwap: Model<INFTSwap> = model<INFTSwap>('NFTSwap', NFTSwapSchema);
export default NFTSwap;