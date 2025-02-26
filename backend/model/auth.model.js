import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        fullname: {
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
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: [],
            },
        ],
        following: [
            {
                type: mongoose.Schema.Types.ObjectId, // Fixed the typo here
                ref: "User",
                default: [],
            },
        ],
        profileimg: {
            type: String,
            default: "",
        },
        coverimg: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
        },
        link: {
            type: String,
            default: "",
        },
        likedposts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: []
        }]
    },
    { timestamps: true } // Add timestamps for createdAt and updatedAt
);

const User = mongoose.model("User", userSchema);
export default User;
