import mongoose from "mongoose";

const connectToMongo=async()=>{

    try{
        await mongoose.connect(process.env.mongo_db_url);
        console.log("sucessfully connected to db")
    }
    catch(error){
        console.log("error occured in connection to db",error.message)
    }
}

export default connectToMongo;