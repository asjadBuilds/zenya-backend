import { validationResult } from 'express-validator';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Doctor from '../models/doctorModel.js';
import Review from '../models/reviewModel.js';

const addReview = AsyncHandler(async (req, res) => {
    const { doctorId, rating, comment } = req.body;
    const result = validationResult(req);
    if (result.isEmpty()) throw new ApiError(400, "Invalid details");
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new ApiError(400, "Invalid Doctor");
    await Review.create({
        doctorId,
        userId: req.user._id,
        rating,
        comment
    });
    res
        .status(201)
        .json(new ApiResponse(201, "Review added successfully"))
})

const editReview = AsyncHandler(async (req, res) => {
    const { comment, rating, reviewId } = req.body;
    const result = validationResult(req);
    if (!result.isEmpty()) throw new ApiError(400, "Invalid details");
    const updateFields = {};
    if (comment !== undefined) updateFields.comment = comment;
    if (rating !== undefined) updateFields.rating = rating;
    await Review.findByIdAndUpdate(reviewId, {
        $set: { updateFields }
    }, { new: true });
    res
        .status(200)
        .json(new ApiResponse(200, "Review updated successfully"));
})

const deleteReview = AsyncHandler(async (req, res) => {
    const { reviewId } = req.body;
    const result = validationResult(req);
    if (result.isEmpty()) throw new ApiError(400, "Invalid details");
    await Review.findByIdAndDelete(reviewId);
    res
        .status(200)
        .json(new ApiResponse(200, "Review deleted successfully"));
})

const getDoctorReviews = AsyncHandler(async (req, res) => {
    const { doctorId } = req.body;
    const result = validationResult(req);
    if (result.isEmpty()) throw new ApiError(400, "Invalid details");
    const reviews = await Review.find({ doctorId }).populate('userId');
    res
        .status(200)
        .json(new ApiResponse(200, reviews, "Reviews fetched successfully"));
})

const getUserReviews = AsyncHandler(async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) throw new ApiError(400, "Invalid details");
    const reviews = await Review.find({ userId: req.user._id }).populate('userId');
    res
        .status(200)
        .json(new ApiResponse(200, "Reviews fetched successfully", reviews));
})
const getReviewsByDoctor = AsyncHandler(async (req, res) => {
    let {
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "desc",
      search = "",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Build match conditions
    const match = {};
    match.doctorId = req?.user?._id

    // Aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "users", // collection name in MongoDB
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" }
    ];

    // Add search
    if (search) {
      match.$or = [
        { "userId.username": { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } }
      ];
    }

    pipeline.push({ $match: match });

    // Count total before pagination
    const totalResult = await Review.aggregate([
      ...pipeline,
      { $count: "count" }
    ]);
    const total = totalResult[0]?.count || 0;

    // Add sort, skip, limit
    pipeline.push({ $sort: sort }, { $skip: skip }, { $limit: limit });

    // Select only needed fields
    pipeline.push({
      $project: {
        _id: 1,
        rating: 1,
        comment: 1,
        createdAt: 1,
        "user.username": 1
      }
    });

    const data = await Review.aggregate(pipeline);

    res.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
})

export {
    addReview,
    editReview,
    deleteReview,
    getDoctorReviews,
    getUserReviews,
    getReviewsByDoctor
}