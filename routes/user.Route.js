import express from 'express';
import { getUserProfile, updateUserAvatar, updateUsername } from '../controllers/userControllers.js';
import { query } from 'express-validator';
import upload from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const route = express.Router();

route.get('getUserProfile', verifyJWT, getUserProfile);

route.get('/updateUsername',
    [query('username').notEmpty().withMessage('Username is required')],
    verifyJWT,
    updateUsername
)

route.post('/updateUserAvatar',
    upload.single('avatar'),
    verifyJWT,
    updateUserAvatar);

export default route;