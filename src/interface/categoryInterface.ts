import mongoose from "mongoose";

interface Category {
    name: string;
    unlistStatus: boolean;
    offer: mongoose.Types.ObjectId[];
    offerApplied:boolean;
  }


  export default Category