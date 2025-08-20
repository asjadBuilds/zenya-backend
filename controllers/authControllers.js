import { validationResult } from 'express-validator';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Doctor from '../models/doctorModel.js';
import { uploadFileonCloudinary } from '../utils/cloudinary.js';
import User from '../models/userModel.js';
import Otp from '../models/otpModel.js';
import { sendOtpMail } from '../utils/mailGenerator.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { generateAccessAndRefreshToken } from '../utils/tokenGenerator.js';
const registerDoctor = AsyncHandler(async (req, res) => {
    const { fullname, email, password, phone, country, city, specialization, categoryId, appointmentFees, currency } = req.body;
    const result = validationResult(req);
    if (result.isEmpty()) {
        throw new ApiError(400, "Invalid Credentials", result.array());
    }
    const UserExists = await User.findOne({ email });
    if (UserExists) throw new ApiError(400, "User with this email already exists")
    const DoctorExists = await Doctor.findOne({ email });
    if (DoctorExists) throw new ApiError(400, "Doctor already exists with this email");

    const avatarLocalPath = req.file?.path;
    const avatar = await uploadFileonCloudinary(avatarLocalPath);
    if (!avatar) throw new ApiError(400, "Avatar file is required");
    const doctor = await Doctor.create({
        fullname,
        email,
        password,
        phone,
        country,
        city,
        specialization,
        avatar: avatar?.url,
        category: categoryId,
        appointmentFees,
        currency
    })
    res
        .status(201)
        .json(new ApiResponse(201, doctor, "Doctor registered successfully"));
})

const registerUser = AsyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    const result = validationResult(req);
    if (result.isEmpty()) throw new ApiError(400, "Invalid Credentials");
    const DoctorExists = await Doctor.findOne({ email });
    if (DoctorExists) throw new ApiError(400, "Doctor already exists with this email");
    const userExists = await User.findOne({ email });
    if (userExists) throw new ApiError(400, "User already exists with this email");
    const avatarLocalPath = req.file?.path;
    const avatar = await uploadFileonCloudinary(avatarLocalPath);
    if (!avatar) throw new ApiError(400, "Avatar file is required");
    const user = await User.create({
        username,
        email,
        password,
        avatar: avatar?.url
    })
    res
        .status(201)
        .json(new ApiResponse(201, user, "User registered successfully"));
})

const registerSocialUser = AsyncHandler(async (req, res) => {
    const { email, password, avatar } = req.body;
    const results = validationResult(req);
    if (results.isEmpty()) throw new ApiError(400, "Invalid Credentials");
    const isDoctor = await Doctor.findOne({ email });

    if (isDoctor) {
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(isDoctor._id, 'doctor')
        const data = { accessToken, refreshToken, isVerified:isDoctor?.isVerified, role:'doctor' }
        return res
            .status(200)
            .json(new ApiResponse(409,data, "Doctor Tokens Sended Successfully"));
    }
    const user = await User.findOne({ email });
    if (!user) {
        const username = email.split("@")[0];
        await User.create({
            username,
            email,
            password,
            avatar,     
        })
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id, 'user')
    const data = { accessToken, refreshToken, role:'user' }
    res
        .status(200)
        .json(new ApiResponse(200, data, "User Registration Successfully Completed"))
})

const loginUser = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = validationResult(req);
    if (result.isEmpty()) throw new ApiError(400, "Invalid Credentials");
    let account = await User.findOne({ email });
    let role = 'user';
    let isVerified = false
    if (!account) {
        account = await Doctor.findOne({ email });
        role = 'doctor';
        isVerified = account?.isVerified
    }
    if (!account) {
        return res.status(401).json(new ApiResponse(401, "Invalid email or password"));
    }
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
        return res.status(401).json({ error: 'Password is Incorrect' });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(account._id, role)
    return res
        .status(200)
        .json({
            id: account._id,
            email: account.email,
            role,
            isVerified,
            username: account.username || account.fullname,
            avatar: account.avatar,
            accessToken,
            refreshToken
        });
})

const forgetPassword = AsyncHandler(async (req, res) => {
    const { email, role } = req.body;
    const result = validationResult(req.body);
    if (!result.isEmpty()) throw ApiError(402, "Invalid credentials");
    let user;
    if (role === "DOCTOR") {
        user = await Doctor.findOne({ email });
    } else if (role === "USER") {
        user = await User.findOne({ email });
    }
    if (!user) throw new ApiError(402, "User Not Found");
    const response = await sendOtpMail(email);
    if (!response) throw new ApiError(402, "Unable to send email");
    res
        .status(200)
        .json(new ApiResponse(200, {}, "OTP sent to your email"));
})

const verifyOtp = AsyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const result = validationResult(req.body);
    if (!result.isEmpty()) throw new ApiError(402, "Invalid credentials");
    const verifiedOtp = await Otp.findOne({ email });
    if (!verifiedOtp) throw new ApiError(402, "OTP Not Found");
    if (verifiedOtp.otp !== otp) throw new ApiError(402, "Invalid OTP");
    res
        .status(200)
        .json(new ApiResponse(200, {}, "OTP verified successfully"));
})

const resetPassword = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = validationResult(req.body);
    if (!result.isEmpty()) throw new ApiError(402, "Invalid credentials");
    let user = await User.findOne({ email })
    if (!user) {
        user = await Doctor.findOne({ email })
    }
    if (!user) throw new ApiError(404, "User not found");
    user.password = password;
    await user.save({ validateBeforeSave: false });
    res
        .status(200)
        .json(new ApiResponse(200, {}, "Password reset successfully"));
})

const changePassword = AsyncHandler(async (req, res) => {
    const { oldPassword, newPassword, role } = req.body;
    const result = validationResult(req.body);
    if (!result) throw new ApiError(400, "invalid password details");
    let validUser = await User.findById(req?._id);
    if (!validUser) {
        validUser = await Doctor.findById(req?._id);
    }
    if (!validUser) throw new ApiError(401, "Invalid User");
    const confirmPass = validUser.isPasswordCorrect(oldPassword);
    if (!confirmPass) throw new ApiError(401, "Incorrect Password");
    if (role === "DOCTOR") {
        await Doctor.findByIdAndUpdate(validUser._id, {
            $set: {
                password: newPassword,
            },
        });
    } else if (role === "USER") {
        await User.findByIdAndUpdate(validUser._id, {
            $set: {
                password: newPassword,
            },
        });
    }
    res
        .status(200)
        .json(new ApiResponse(200, "User Password Changed Successfully"));
});

const refreshAccessToken = AsyncHandler(async (req, res) => {
    const incomingToken = req?.cookies?.refreshToken || req?.body?.refreshToken;
    if (!incomingToken) throw new ApiError(402, "No Refresh Token Found");
    const decodedToken = jwt.verify(
        incomingToken,
        process.env.REFRESH_TOKEN_SECRET
    );
    let role = 'user'
    let user = await User.findById(decodedToken._id).select('-password');
    if (!user) {
        user = await Doctor.findById(decodedToken._id).select('-password');
        role = 'doctor'
    }
    if (!user) throw new ApiError(404, "User not found");
    //   const decryptedToken = decryptToken(
    //     user.refreshToken,
    //     process.env.REFRESH_TOKEN_SECRET
    //   );
    if (incomingToken !== user.refreshToken) throw new ApiError(402, "Invalid Refresh Token");
    const options = {
        secure: true,
        sameSite: 'None'
    };
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
        role
    );
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access Token Refreshed Successfully"
            )
        );
});

const saveAuthTokens = AsyncHandler(async (req, res) => {
    const { token, doctorId } = req.body;
    const doctor = await Doctor.findOneAndUpdate({ _id: doctorId }, {
        $set: { googleRefreshToken: token }
    }, { new: true });
    console.log(doctor)
    res
        .status(200)
        .json(new ApiResponse(200, "Google Refresh Token saved in Database"))
})


export {
    registerDoctor,
    registerUser,
    registerSocialUser,
    loginUser,
    forgetPassword,
    verifyOtp,
    resetPassword,
    changePassword,
    refreshAccessToken,
    saveAuthTokens
}