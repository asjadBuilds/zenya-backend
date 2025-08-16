import { validationResult } from 'express-validator';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Doctor from '../models/doctorModel.js';
import Category from '../models/categoryModel.js';
import mongoose from 'mongoose';
const getDoctorProfile = AsyncHandler(async (req, res) => {
    const { doctorId } = req.body;
    const result = validationResult(req);
    if (result.isEmpty()) throw new ApiError(400, "Validation error");
    const doctor = await Doctor.findById(doctorId).select('-password -refreshToken');
    if (!doctor) throw new ApiError(404, "Doctor not found");
    res
        .status(200)
        .json(new ApiResponse(200, doctor, "Doctor profile fetched successfully"));
})

const getDoctorsByCategory = AsyncHandler(async (req, res) => {
    const { categoryId, country, city } = req.body;
    const result = validationResult(req);
    if (result.isEmpty()) throw new ApiError(400, "Validation error");
    const queryFields = {};
    if (categoryId) queryFields.category = categoryId;
    if (country) queryFields.country = new RegExp(`^${country}$`, 'i');
    if (city) queryFields.city = new RegExp(`^${city}$`, 'i');
    const doctors = await Doctor.find(queryFields);
    res
        .status(200)
        .json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
})

const getDoctorsByLocation = AsyncHandler(async (req, res) => {
    const { country, city } = req.body;
    const result = validationResult(req);
    if (!result.isEmpty()) throw new ApiError(400, "Validation error");
    const doctors = await Doctor.find({ country, city });
    res
        .status(200)
        .json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
})

const getDoctorsByQuery = AsyncHandler(async (req, res) => {
    const { name } = req.query;
    const doctors = await Doctor.find(
        { fullname: { $regex: name, $options: 'i' } }
    );
    res
        .status(200)
        .json(new ApiResponse(200, doctors, "Doctors fetched successfully"));
})

const updateDoctorProfile = AsyncHandler(async (req, res) => {
    const { fullname, email, phone, country, city, specialization, bio, categoryId } = req.body;
    const result = validationResult(req);
    if (!result.isEmpty()) throw new ApiError(400, "Validation error");
    const avatarLocalPath = req.file?.path;
    const avatar = await uploadFileonCloudinary(avatarLocalPath);
    if (!avatar) throw new ApiError(400, "Avatar file is required");
    const updateFields = {}
    if (fullname !== undefined) updateFields.fullname = fullname;
    if (email !== undefined) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    if (country !== undefined) updateFields.country = country;
    if (city !== undefined) updateFields.city = city;
    if (specialization !== undefined) updateFields.specialization = specialization;
    if (bio !== undefined) updateFields.bio = bio;
    if (categoryId !== undefined) updateFields.category = categoryId;
    if (avatar) updateFields.avatar = avatar.url;

    const doctor = await Doctor.findByIdAndUpdate(req.user._id, {
        $set: updateFields
    }, { new: true });

    res
        .status(200)
        .json(new ApiResponse(200, doctor, "Doctor profile updated successfully"));
})

const getCategories = AsyncHandler(async (req, res) => {
    const categories = await Category.find({});
    const hello = 'hello';
    res
        .status(200)
        .json(new ApiResponse(200, categories, "Categories fetched successfully"));
})

const addEducation = AsyncHandler(async (req, res) => {
  const {
    instituteName,
    degreeName,
    startDate,
    endDate
  } = req.body;
  // const result = validationResult(req.body);
  // if (!result) throw new ApiError(402, "Invalid details");
  const userInfo = await Doctor.findOneAndUpdate(
    { _id: req.user._id },
    {
      $push: {
        education: {
          _id: new mongoose.Types.ObjectId(),
          instituteName,
          degreeName,
          startDate,
          endDate
        },
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, userInfo, "User Education updated Successfully")
    );
});

const editEducation = AsyncHandler(async (req, res) => {
  const {
    instituteName,
    degreeName,
    startDate,
    endDate,
    educationId
  } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id, "education._id": educationId },
    {
      $set: {
        "education.$.instituteName": instituteName,
        "education.$.degreeName": degreeName,
        "education.$.startDate": startDate,
        "education.$.endDate": endDate,
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(new ApiResponse(200, "User Education updated Successfully"));
});

const deleteEducation = AsyncHandler(async (req, res) => {
  const { educationId } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        education: {
          _id: educationId,
        },
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, "User Education deleted Successfully"));
});
const addExperience = AsyncHandler(async (req, res) => {
  const {
    instituteName,
    role,
    startDate,
    endDate
  } = req.body;
  // const result = validationResult(req.body);
  // if (!result) throw new ApiError(402, "Invalid details");
  const userInfo = await Doctor.findOneAndUpdate(
    { _id: req.user._id },
    {
      $push: {
        experience: {
          _id: new mongoose.Types.ObjectId(),
          instituteName,
          role,
          startDate,
          endDate
        },
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(
      new ApiResponse(200, userInfo, "User Experience updated Successfully")
    );
});

const editExperience = AsyncHandler(async (req, res) => {
  const {
    companyName,
    role,
    startDate,
    endDate,
    experienceId,
  } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id, "experience._id": experienceId },
    {
      $set: {
        "experience.$.companyName": companyName,
        "experience.$.role": role,
        "experience.$.startDate": startDate,
        "experience.$.endDate": endDate,
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(new ApiResponse(200, "User Education updated Successfully"));
});

const deleteExperience = AsyncHandler(async (req, res) => {
  const { experienceId } = req.body;
  const result = validationResult(req.body);
  if (!result) throw new ApiError(402, "Invalid details");
  await UserInfo.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: {
        experience: {
          _id: experienceId,
        },
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, "User Experience deleted Successfully"));
});

export {
    getDoctorProfile,
    getDoctorsByCategory,
    getDoctorsByLocation,
    getDoctorsByQuery,
    updateDoctorProfile,
    getCategories,
    addEducation,
    editEducation,
    deleteEducation,
    addExperience,
    editExperience,
    deleteExperience
}