import "dotenv/config"

import express from "express";
import cookieParser from "cookie-parser";

import userRouter from "./app/Routes/user.route.js"
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/POST/api", userRouter);
app.use("/GET/api", userRouter);


const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log("App is running on Port: ", PORT)
})