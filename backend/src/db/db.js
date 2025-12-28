import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch(error){
        console.error("Error connecting to the database:",error)
        process.exit(1);
    }
}