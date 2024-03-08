import mongoose, { Schema } from "mongoose";
import { IWishlistDocument, IWishlistModel } from "../interface/wishlistInterface";
const wishlistSchema = new Schema<IWishlistDocument>({
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "productdb",
          required: true,
        },
      },
    ],
  });
  
  // Define the Wishlist model
  const Wishlistdb: IWishlistModel = mongoose.model<IWishlistDocument, IWishlistModel>("wishlistdb", wishlistSchema);
  
  export default Wishlistdb;