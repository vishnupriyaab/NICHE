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
});

const productDb = mongoose.model<Product>("productdb", productSchema);

export default productDb;
