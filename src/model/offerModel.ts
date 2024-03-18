import mongoose from "mongoose";
import IOffer from "../interface/offerInterface";

const offerSchema = new mongoose.Schema<IOffer>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  startingDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isActive:{
    type: Boolean,
    required: true,
  }
});

const Offerdb = mongoose.model<IOffer>("offerdb", offerSchema);

export default Offerdb;
