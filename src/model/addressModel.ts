import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdb",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: Number,
    required: true,
  },
  hNo: {
    type: Number, // Assuming this is for house number
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pin: {
    type: Number,
    required: true,
  },
  addressType: {
    type: String,
    required: true,
  },
  defaultaddress: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Addressdb = mongoose.model("addressdb", addressSchema);

export default Addressdb;
