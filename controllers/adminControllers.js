import { validationResult } from 'express-validator';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Category from '../models/categoryModel.js';
import { uploadFileonCloudinary } from '../utils/cloudinary.js';
const createCategory = AsyncHandler(async(req,res)=>{
    const {name} = req.body;
    const errors = validationResult(req);
    if (errors.isEmpty()) throw new ApiError(400, "Validation Error");
    const avatarLocalPath = req.file?.path;
    const avatar = await uploadFileonCloudinary(avatarLocalPath);
    if (!avatar) throw new ApiError(400, "Avatar file is required");
    const category = await Category.create({
        name,
        avatar: avatar?.url
    })
    res
        .status(201)
        .json(new ApiResponse(201, category, "Category created successfully"));
})

export { createCategory };