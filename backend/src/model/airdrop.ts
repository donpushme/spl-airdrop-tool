import mongoose, { Document, Schema, Model, model } from 'mongoose';

// Define the interface for the NFTSwap document
export interface IAirdrop extends Document {
  user: string,
  wallet: string,
  token: string,
  date: Date
}

// Create the schema for the NFTSwap model
const AirdropSchema: Schema = new Schema({
  user: {type: String, required:true},
  wallet: { type: String, required: true },
  token: {type: String, required: true},
  date: { type: Date, required: true, default: Date.now }
});

// Create and export the model
const Airdrop: Model<IAirdrop> = model<IAirdrop>('Airdrop', AirdropSchema);
export default Airdrop;