import mongoose from "mongoose";

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connect Successfuly");
    }catch(err){
        console.log(err);
    }
}

export default connectDB;