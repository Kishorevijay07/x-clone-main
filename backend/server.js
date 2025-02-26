import express from "express";
import dotenv from "dotenv"
import authfunction from './routes/auth.route.js';
import connectdb from "./db/connectdb.js";
import cookieParser from "cookie-parser";
import userfunction from './routes/user.route.js';
import postfunction from './routes/post.route.js';
import notificationfunction from './routes/user.notification.js'
import cloudinary from 'cloudinary';
import cors from "cors"
import path from "path"

const app = express();
dotenv.config();
const __dirname = path.resolve();

cloudinary.config({
    cloud_name :process.env.cloudinary_name,
    api_key : process.env.cloudinary_API_KEY,
    api_secret : process.env.cloudinary_API_SECRET_KEY
})
const port = process.env.port;

app.use(express.json(
    {
        limit : "7mb"
    }
))
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use(express.urlencoded({
    extended:true
}))
app.use(cookieParser())
app.use('/api/auth',authfunction)
app.use('/api/users',userfunction)
app.use('/api/posts',postfunction)
app.use('/api/notification',notificationfunction)

if(process.env.NODE_ENV=== "production"){
    app.use(express.static(path.join(__dirname , "/frontend/build")))
    app.use("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"frontend","build","index.html"))
    })
    
}
app.listen(port,()=>{
    console.log(`Server running successfully in port ${port}`)
    connectdb();
})