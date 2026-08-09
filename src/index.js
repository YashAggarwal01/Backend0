//require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "../db/index.js";
dotenv.config({
    path:'./.env'
})

//first method

connectDB()
/*there are multiple approach to connect DB this below is first approach using a iffi
( async() => {
    try{
        await mongoose.connect(`${ProcessingInstruction.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=> {
            console.log("ERRR:",error);
            throw error
        })
        app.listen(process.env.PORT,() => {
            console.log(`App is listingn on port ${process.env.PORT}`)
        })
    }catch(error){
        console.log("ERROR:",error)
        throw error
    }
})()
    */

