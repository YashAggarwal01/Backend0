import mongoose from "mongoose"

const patientSchema = new mongoose.Schema({
    name:{
        reuired:true,
        type:String
    },
    diagonsedWith:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    bloodgroup:{
        type:String,
        required:true
    },
    gednder:{
        type:String,
        enum:["M"."F","O"],
        required:true
    },
    admittedin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Hospital'
    },
},{timestamps:true});

export const Patient = mongoose.model("Patient",patientSchema)