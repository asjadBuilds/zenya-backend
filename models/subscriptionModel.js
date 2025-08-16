import mongoose from "mongoose"
const subscriptionSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        refPath:'userType'
    },
    userType:{
        type:String,
        required:true,
        enum:['Doctor','Patient']
    },
    plan:{
        type:String,
        required:true,
        enum:['3_months' , '6_months' , '12_months' , 'yearly_premium']
    },
    startDate:{
        type:Date
    },
    endDate:{
        type:Date
    },
    paymentId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Payment'
    },
    isActive:{
        type:String
    },
},{timestamps:true});

const Subscription = mongoose.model('Subscription',subscriptionSchema);
export default Subscription;