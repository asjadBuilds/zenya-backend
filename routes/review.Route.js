import express from 'express';
import { query } from 'express-validator';
import { addReview, deleteReview, editReview, getDoctorReviews, getReviewsByDoctor, getUserReviews } from '../controllers/reviewControllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const route = express.Router();

route.post('/addReview',
    [
        query('doctorId').notEmpty().withMessage('Doctor ID is required'),
        query('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        query('comment').isString().withMessage('Comment must be a string')
    ],
    verifyJWT,
    addReview);

route.post('/editReview',
    [
        query('reviewId').notEmpty().withMessage('Review ID is required'),
        query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        query('comment').optional().isString().withMessage('Comment must be a string')
    ],
    verifyJWT,
    editReview);

route.post('/deleteReview',
    [
        query('reviewId').notEmpty().withMessage('Review ID is required')
    ],
    verifyJWT,
    deleteReview);

route.post('/getDoctorReviews',
    [
        query('doctorId').notEmpty().withMessage('Doctor ID is required')
    ],
    getDoctorReviews);

route.get('/getUserReviews',
    verifyJWT,
    getUserReviews);

route.get('/getReviewsByDoctor',verifyJWT,getReviewsByDoctor)

export default route;