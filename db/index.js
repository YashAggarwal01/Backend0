import mongoose from"mongoose"
import { DB_NAME } from "../src/constants.js"

console.log("MONGODB_URI =", JSON.stringify(process.env.MONGODB_URI));

const connectDB = async() => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMongoDB Connected!!! DB HOST:${connectionInstance.connection.host}`);

    }catch(error){
        console.log("MONGODB connection error",error);
        process.exit(1);
    }
}

export default connectDB