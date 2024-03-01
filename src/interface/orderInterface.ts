import { Schema } from "mongoose";

interface Product {
  product: Schema.Types.ObjectId;
  quantity: number;
  price: number;
  offer: string | false;
}

interface Order extends Document {
  products: Product[];
  orderId: string;
  payment: any; // Define the type for payment object accordingly
  cancleReason: string;
  orderStatus:
    | "Not Processed"
    | "Processing"
    | "Dispatched"
    | "Cancelled"
    | "Delivered"
    | "Returned";
  address: string[]; // Define the type for address array accordingly
  orderTotal: number;
  orderedDate: string;
  orderBy: Schema.Types.ObjectId;
  expectedDelivery: string;
  createdAt: Date;
  updatedAt: Date;
}

export default Order;