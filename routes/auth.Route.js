import express from 'express';
import { changePassword, forgetPassword, loginUser, refreshAccessToken, registerDoctor, registerSocialUser, registerUser, resetPassword, saveAuthTokens, verifyOtp } from '../controllers/authControllers.js';
import { query } from 'express-validator';
import upload from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const route = express.Router();

route.post('/registerDoctor',
    [
        query('fullname').notEmpty().withMessage('Full name is required'),
        query('email').isEmail().withMessage('Valid email is required'),
        query('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
        query('phone').notEmpty().withMessage('Phone number is required'),
        query('country').notEmpty().withMessage('Country is required'),
        query('city').notEmpty().withMessage('City is required'),
        query('specialization').notEmpty().withMessage('Specialization is required'),
        query('categoryId').notEmpty().withMessage('Category ID is required')
    ],
    upload.single('avatar'),
    registerDoctor);

route.post('/registerUser',
    [
        query('username').notEmpty().withMessage('Username is required'),
        query('email').isEmail().withMessage('Valid email is required'),
        query('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],
    upload.single('avatar'),
    registerUser
)

route.post('/registerSocialUser',
    [
        query('email').isEmail().withMessage('Valid email is required'),
        query('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
        query('avatar').isString().withMessage('Avatar is required')
    ],
    registerSocialUser
)

route.post('/login',
    [
        query('email').isEmail().withMessage('Valid email is required'),
        query('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],
    loginUser
)

route.post('/forgetPassword',
    [
        query('email').isEmail().withMessage('Valid email is required'),
     query('role').notEmpty().withMessage('Role is required')
    ],
    forgetPassword
)

route.post('/verifyOtp',
    [
        query('email').isEmail().withMessage('Valid email is required'),
        query('otp').notEmpty().withMessage('OTP is required')
    ],
    verifyOtp
)

route.post('/resetPassword',
    [
        query('email').isEmail().withMessage('Valid email is required'),
        query('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters long'),
    ],
    resetPassword
)

route.post('/changePassword',
    [
        query('role').isEmpty().withMessage('role is required'),
        query('oldPassword').isLength({ min: 8 }).withMessage('Old password must be at least 8 characters long'),
        query('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    ],
    verifyJWT,
    changePassword
)

route.post('/refreshAccessToken',refreshAccessToken)

route.post('/saveRefreshToken',saveAuthTokens);

export default route;