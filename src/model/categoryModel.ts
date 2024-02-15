import mongoose, { Schema } from "mongoose";

interface Category{
    name: string;
    action: boolean;
    edit: boolean;

}

const categorySchema = new Schema<Category>({
    name: {
        type: String,
        required: true,
    },
    action: {
        type: Boolean,
        required: true,
    },
    edit: {
        type: Boolean,
        required: true,
    }
})
const categoryDb = mongoose.model<Category>('categorydb',categorySchema);
export default categoryDb;