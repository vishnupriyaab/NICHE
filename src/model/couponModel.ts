import mongoose from "mongoose";
import Coupon from "../interface/couponInterface";

const couponSchema = new mongoose.Schema<Coupon>({
    couponCode: {
      type: String,
      required: true,
    },
    couponDescription: {
      type: String,
      required: true,
    },
    
    category: {
      type: String,
      required: true,
    },
    coupondiscount: {
      type: Number,
      required: true,
    },
    maxUse: {
      type: Number,
      required: true,
    },
    priceLimit: {
      type: Number,
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    
    userUsed: [{
      type: String,
    }],
  },
  {timestamps: true},
  );
  
  const CouponDb = mongoose.model<Coupon>("coupondb", couponSchema);
  
  export default CouponDb;
  