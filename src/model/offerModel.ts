import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
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

const Offerdb = mongoose.model("offerdb", offerSchema);

export default Offerdb;
