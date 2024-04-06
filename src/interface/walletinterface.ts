import mongoose from "mongoose";

interface Transaction {
    date: string | number | Date;
    amount: number;
    type: string;
    transactionDate: Date;
}

export interface Wallet extends Document {
    userId: mongoose.Types.ObjectId;
    walletBalance: number;
    transactions: Transaction[];
}