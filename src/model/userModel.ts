import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../interface/userInterface';

const userSchema = new Schema<User>({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
    },
    block: {
        type: Boolean,
        default: false,
    },
    liveStatus: {
        type: Boolean,
        default: true,
    },
    refferalOfferToken: {
        type: String,
    },
    refferedToken: {
        type: String,
    }

});

// Use a pre-save hook to hash the password before saving
userSchema.pre('save', async function (next) {
    const user = this as Document & User;

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

const userDb = mongoose.model<User>('userdb', userSchema);

export default userDb;
