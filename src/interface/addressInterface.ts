import { Document, Types } from 'mongoose';

interface Address extends Document {
  userId: Types.ObjectId;
  name: string;
  phonenumber: number;
  pincode: number;
  locality: string;
  district: string;
  state: string;
  addressType: string;
  defaultaddress: boolean;
  createdAt: Date;
}

export default Address;
