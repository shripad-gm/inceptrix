import express from 'express';
import dotenv from 'dotenv';
import cookieparser from 'cookie-parser';
import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import postRoutes from './routes/post.route.js'
import adminRoutes from './routes/adminContent.route.js'
import connectToMongo from './db/connectToMongo.js';
import notificationRoutes from './routes/notification.route.js'
import {v2 as coudinary} from 'cloudinary';
import cors from 'cors';
dotenv.config();
coudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    secure:true
});
const app=express({limit:'5mb'});
app.use(cors());
const port=process.env.PORT || 5000;

app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use("/api/auth",authRouter);
app.use("/api/users",userRouter);
app.use("/api/posts",postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin",adminRoutes)

app.listen(port,()=>{
    connectToMongo();
    console.log(`server is running on port ${port}`)

})