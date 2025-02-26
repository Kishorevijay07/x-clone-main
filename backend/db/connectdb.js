import mongoose from "mongoose";

const connectdb = async ()=>{
    try{
        await mongoose.connect(process.env.mongodb_url); 
        console.log("mongo db connected successfully")
    }
    catch(error)
    {
        console.log(`Error to connecting DB ${error}`)
        process.exit(1);
    }
}

export default connectdb;