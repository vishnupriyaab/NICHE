import { Schema } from "mongoose";

interface IProduct {
  product: Schema.Types.ObjectId;
  quantity: number;
  price: number;
  offer: string | false;
}

interface IOrder extends Document {
  products: IProduct[];
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
  address: any[]; // Define the type for address array accordingly
  orderTotal: number;
  orderedDate: string;
  orderBy: Schema.Types.ObjectId;
  expectedDelivery: string;
  createdAt: Date;
  updatedAt: Date;
}
