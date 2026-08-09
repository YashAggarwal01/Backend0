import mongoose from "mongoose"

const doctorSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    salary:{
        type:String,
        required:true
    },
    qualification:{
        type:String,
        required:true
    },
    experienceInYears:{
        type:Number,
        deafult:0
    },
    woksin:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Hospitals"
        },
    ]
},{timestamps:true})

export const Doctor = mongoose.model("Doctor",doctorSchema)