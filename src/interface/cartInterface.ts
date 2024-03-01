
import mongoose from "mongoose";

interface Product {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

interface Cart extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
    cartTotal: any;
}

export default Cart;
