import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";
import ApiError from "./ApiError.js";
const generateAccessAndRefreshToken = async (userId,role) => {
    try {
      let account;
      if(role === 'user'){
        account = await User.findById(userId);
        if (!account) throw ApiError(404, "User Not Found");
      }else if(role === 'doctor'){
        account = await Doctor.findById(userId);
        if(!account) throw ApiError(404, "Doctor Not Found");
      }
      
      const accessToken = account.generateAccessToken();
      const refreshToken = account.generateRefreshToken();
      account.refreshToken = refreshToken;
      await account.save({ validateBeforeSave: false });
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiError(500, "Something went wrong");
    }
  };

  export {generateAccessAndRefreshToken};