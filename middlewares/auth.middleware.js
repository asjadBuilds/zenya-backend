import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Doctor from '../models/doctorModel.js';
const verifyJWT = AsyncHandler(async (req, res, next)=>{
    try { 
      
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        console.log('incoming token',token)
        if(!token) throw new ApiError(402, "Token not found");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!decodedToken) throw new ApiError(401, "Invalid token");
        let user = await User.findById(decodedToken._id).select('-password');
        if(!user){
          user = await Doctor.findById(decodedToken._id).select('-password');
        }
        if(!user) throw new ApiError(404, "User not found");
        req.user=user
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Token expired");
          } else {
            throw new ApiError(401, `Invalid token : ${error}`);
          }
    }
})

export {verifyJWT};