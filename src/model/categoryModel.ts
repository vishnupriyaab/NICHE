import mongoose, { Schema } from "mongoose";
import Category from "../interface/categoryInterface";


const categorySchema = new Schema<Category>({
  name: {
    type: String,
    required: true,
  },
  unlistStatus: {
    type: Boolean,
    default: false,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "offerdb",
  },
});
const categoryDb = mongoose.model<Category>("categorydb", categorySchema);
export default categoryDb;
