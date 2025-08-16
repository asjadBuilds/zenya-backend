import express from 'express';
import { query } from 'express-validator';
import upload from '../middlewares/multer.middleware.js';
import { createCategory } from '../controllers/adminControllers.js';

const route = express.Router();

route.post('/create-category',
    [
        query('name').notEmpty().withMessage('Category name is required'),
    ],
    upload.single('avatar'),
    createCategory);

export default route;