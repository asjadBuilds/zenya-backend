import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userType'
    },
    userType: {
        type: String,
        required: true,
        enum: ['Doctor', 'Patient']
    },
    amount:{
        type:Number,
        required:true
    },
    currency:{
        type:String,
        required:true
    },
    transactionId:{
        type:String,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:['PAID','FAILED']
    }
},{timestamps:true});

const Payment = mongoose.model('Payment',paymentSchema);
export default Payment;