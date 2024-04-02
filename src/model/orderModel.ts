import mongoose from "mongoose";
import { IOrder } from "../interface/orderInterface";
import CouponDb from "./couponModel";

const orderSchema = new mongoose.Schema<IOrder>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userdb",
    required: true,
  },
  orderDetails: [
    {
      pName: {
        type: String,
        required: true,
      },
      pImage: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      originalProductPrice: {
        type: Number,
        required: true,
      },
      offerApplied: {
        type: Boolean,
        default: false,
      },
      quantity: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      paymentMethod: {
        type: String,
        required: true,
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productdb",
        required: true,
      },
      orderStatus: {
        type: String,
        default: "Ordered",
        required: true,
      },
      orderDate: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  totalsum: {                                                                                                                                               
    type: Number,
    required: true,
  },
  couponApplied: {
    type: Boolean,
    default: false,
  },
  couponDiscount:{
    type: Number,
  }
});

const Orderdb = mongoose.model<IOrder>("orderdb", orderSchema);

export default Orderdb;
