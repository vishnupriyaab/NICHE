import mongoose, { Schema } from "mongoose";
import Cart from "../interface/cartInterface";

const cartSChema = new Schema<Cart>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userdb",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "productdb",
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        price: {
          type: Number
        },
      },
    ],
    cartTotal:{
      default:0,
      type: Number
    },
  },
  {
    timestamps: true,
  }
);

 const CartDb = mongoose.model<Cart>("cartdb", cartSChema);

export default CartDb;
