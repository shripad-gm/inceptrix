import express from 'express';
import dotenv from 'dotenv';
import cookieparser from 'cookie-parser';
import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import connectToMongo from './db/connectToMongo.js';
import {v2 as coudinary} from 'cloudinary';

dotenv.config();
coudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    secure:true
});
const app=express();

const port=process.env.PORT || 5000;

app.use(cookieparser());
app.use(express.json());

app.use("/api/auth",authRouter);
app.use("/api/users",userRouter)

app.listen(port,()=>{
    connectToMongo();
    console.log(`server is running on port ${port}`)

})