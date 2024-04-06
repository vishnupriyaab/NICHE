import mongoose from "mongoose";

export interface IOrder extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  orderDetails: {
    totalPrice: any;
    pName: string;
    pImage: string;
    price: number;
    originalProductPrice:number;
    quantity: number;
    address: string;
    paymentMethod: string;
    productId: mongoose.Schema.Types.ObjectId;
    orderStatus: string;
    orderDate: Date;
    offerApplied: boolean;
  }[];
  couponApplied: boolean;
  fixedShippingCharge: number;
  totalsum: number;
  couponDiscount:number;
}