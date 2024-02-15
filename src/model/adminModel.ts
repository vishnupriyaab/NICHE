import mongoose, { Document,Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IAdmin {
    email: string;
    password: string;
    role: string;
}

const adminSchema = new Schema<IAdmin>({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required :true,
    }
});

// Use a pre-save hook to hash the password before saving
adminSchema.pre('save', async function (next) {
    const user = this as Document & IAdmin;

    // Only hash the password if it's modified or new
    if (!user.isModified('password')) {
        return next();
    }

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);

        // Hash the password using the salt
        const hashedPassword = await bcrypt.hash(user.password, salt);

        // Replace the plain text password with the hashed password
        user.password = hashedPassword;

        next();
    } catch (error:any) {
        return next(error);
    }
});

const adminDb = mongoose.model<IAdmin>('admindb',adminSchema)

export default adminDb;