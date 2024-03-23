import mongoose from "mongoose";
import IOffer from "../interface/offerInterface";

const offerSchema = new mongoose.Schema<IOffer>({
  offerName: {
    type: String,
    required: true,
  },
  offerDescription: {
    type: String,
    required: true,
  },
  discountPercentage: {
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
