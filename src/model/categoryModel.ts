import mongoose, { Schema } from "mongoose";

interface Category {
  name: string;
  unlistStatus: boolean;
  edit: boolean;
}

const categorySchema = new Schema<Category>({
  name: {
    type: String,
    required: true,
  },
  unlistStatus: {
    type: Boolean,
    default: false,
  },
});
const categoryDb = mongoose.model<Category>("categorydb", categorySchema);
export default categoryDb;
