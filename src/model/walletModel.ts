import mongoose, { Schema } from "mongoose";
import { Wallet } from "../interface/walletinterface";


const walletSchema = new Schema<Wallet>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userdb",
        required: true,
      },
    walletBalance: {
        type: Number,
        default: 0,
    },
    transactions: [
        {
            amount: {
                type: Number,
                required: true,
            },
            type:{
                type: String,
                required: true,
            },
            transactionDate: {
                type: Date,
                default: Date.now(),
            },
        }
    ]
})


const Walletdb = mongoose.model<Wallet>('walletdb', walletSchema);

export default Walletdb;
