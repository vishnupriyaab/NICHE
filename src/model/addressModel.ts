import mongoose, { Schema } from "mongoose";

const addresSchema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userDb",
        required: true,
    },
    
})