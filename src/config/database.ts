import mongoose from "mongoose";

export const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string)
    } catch (error) {
        console.log("MongoDB connection error:", error)
    };
};