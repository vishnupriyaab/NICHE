
import { Document } from "mongoose";

interface Coupon extends Document {
    couponCode: string;
    couponDescription:string;
    category: string;
    coupondiscount: number;
    maxUse: number;
    priceLimit: number;
    expiry: Date;
    isDeleted: boolean;
  }
  
  export default Coupon;