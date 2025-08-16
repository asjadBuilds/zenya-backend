import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Doctor'
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    rating:{
        type:Number,
        required:true,
        enum:[1,2,3,4,5]
    },
    comment:{
        type:String,
        required:true
    }
},{timestamps:true});

const Review = mongoose.model('Review',reviewSchema);
export default Review;