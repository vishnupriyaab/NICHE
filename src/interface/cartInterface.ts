
import mongoose from "mongoose";

interface Product {
    productId: mongoose.Types.ObjectId;
    quantity: number;
}

interface Cart extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
}

export default Cart;
