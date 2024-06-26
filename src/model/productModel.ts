import mongoose, { Schema } from "mongoose";
import { Product } from "../interface/productInterface";

const productSchema = new Schema<Product>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  imgArr: {
    type: [String],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categorydb",
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
  offer:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'offerdb',
  }],
  offerPrice: {
    type: Number,
  },
  offerApplied: {
    type: Boolean,
    default: false,
  },
  sold: {
    type: Number,
    default: 0
  },
},
{
  timestamps: true,
}
);

const productDb = mongoose.model<Product>("productdb", productSchema);

export default productDb;
