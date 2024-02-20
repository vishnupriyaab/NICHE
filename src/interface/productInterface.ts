import mongoose from "mongoose";

export interface Product {
    name: string;
    description: string;
    price: number;
    stock: number;
    imgArr: string[];
    category: mongoose.Schema.Types.ObjectId;
    isHidden: boolean;
  }