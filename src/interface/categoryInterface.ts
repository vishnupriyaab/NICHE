import mongoose from "mongoose";

interface Category {
    name: string;
    unlistStatus: boolean;
    edit: boolean;
    offer: mongoose.Types.ObjectId;
  }


  export default Category