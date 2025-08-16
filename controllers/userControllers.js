import { validationResult } from 'express-validator';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/userModel.js';
import { uploadFileonCloudinary } from '../utils/cloudinary.js';


const getUserProfile = AsyncHandler(async(req, res)=>{
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
})

const updateUsername = AsyncHandler(async(req,res)=>{
    const { username } = req.body;
    const result = validationResult(req.body);
    if(!result.isEmpty()) throw new ApiError(402, "Invalid username");
    await User.findByIdAndUpdate(req.user._id, {
        $set:{
            username
        }
    }, {new:true})
    res
    .status(200)
    .json(new ApiResponse(200, "Username updated successfully"));
})

const updateUserAvatar = AsyncHandler(async(req, res)=>{
    const avatarLocalPath = req.file?.path;
    const avatar = await uploadFileonCloudinary(avatarLocalPath);
    if (!avatar) throw new ApiError(400, "Avatar file is required");
    await User.findByIdAndUpdate(req.user._id, {
        $set:{
            avatar: avatar?.url
        }
    },{new:true})
})

export {
    getUserProfile,
    updateUsername,
    updateUserAvatar
}