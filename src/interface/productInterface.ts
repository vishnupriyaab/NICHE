import mongoose from "mongoose";

export interface Product {
    name: string;
    description: string;
    price: number;
    stock: number;
    color: string,
    size: number,
    imgArr: string[];
    category: mongoose.Schema.Types.ObjectId;
    isHidden: boolean;
    offer: mongoose.Schema.Types.ObjectId[];
    offerPrice:number;
    offerApplied:boolean;
    sold:number;
    timestamps: boolean;
  }