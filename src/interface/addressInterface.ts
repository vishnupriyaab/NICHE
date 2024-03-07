import mongoose, { Document } from 'mongoose';

interface Address extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  hNo: number;
  district: string;
  state: string;
  country: string;
  pin: number;
  phonenumber: number;
  addressType: string;
  defaultaddress: boolean;
  createdAt: Date;
}

export default Address;
