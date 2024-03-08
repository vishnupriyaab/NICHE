import mongoose, { Model } from "mongoose";

// Define the interface for the Wishlist document
export interface IWishlist {
    userId: mongoose.Types.ObjectId;
    products: Array<{
      productId: mongoose.Types.ObjectId;
    }>;
  }
  
  // Define the interface for the Wishlist document with mongoose Document methods
 export interface IWishlistDocument extends IWishlist, Document {}
  
  // Define the interface for the Wishlist model
 export interface IWishlistModel extends Model<IWishlistDocument> {}