import mongoose from "mongoose";


const transactionSchema = new mongoose.Schema({
    amount : {
        type : Number,
        required : true
    },
    sender: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "users",
        required : true
    },
    receiver: {
        type : mongoose.Schema.Types.ObjectId,
        ref: "users",
        required : true
    },
    // type : {
    //     type : String,
       
    //     required : true
    // },
    // refrence:{
    //     type : String,
    //     required : true
    // },
    status:{
        type : String,
        required : true
    }

    
}, { timestamps: true })

export const Transaction = mongoose.model("Transaction", transactionSchema);