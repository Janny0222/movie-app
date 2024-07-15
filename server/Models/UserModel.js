import mongoose from "mongoose";
import { Schema } from "mongoose";


// Creating a model for User
const UserSchema = new Schema(
    {
        fullName: {
            type: String,
            required: [true, 'Please add a full name']
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            mainlength: [6, 'Please must be at 6 Characters']
        },
        image: {
            type: String
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        likedMovies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Movie',
            },
        ],
    },
    {
        timestamps: true
    }
);

export default mongoose.model('User', UserSchema)