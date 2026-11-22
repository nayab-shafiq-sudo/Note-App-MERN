import mongoose from "mongoose";


const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Mongo DB connected succesfully.")
    } catch (error) {
        console.log("mongoDB connection error", error)
    }
}

export default connectDb;