import express from 'express';
import { query } from 'express-validator';
import { addEducation, addExperience, deleteEducation, deleteExperience, editEducation, editExperience, getCategories, getDoctorEducation, getDoctorExperience, getDoctorProfile, getDoctorsByCategory, getDoctorsByLocation, getDoctorsByQuery, updateDoctorProfile } from '../controllers/doctorControllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const route = express.Router();

route.post('/getDoctorProfile',
    [query('doctorId').notEmpty().withMessage('Doctor ID is required')],
    getDoctorProfile
)

route.post('/getDoctorsByCategory',
    [
        query('categoryId').notEmpty().withMessage('Category ID is required'),
        query('country').notEmpty().withMessage('country is required'),
        query('city').notEmpty().withMessage('city is required')
    ],
    getDoctorsByCategory
)

route.post('/getDoctorsByLocation',
    [
        query('country').notEmpty().withMessage('Country is required'),
        query('city').notEmpty().withMessage('City is required')
    ],
    verifyJWT,
    getDoctorsByLocation
)

route.post('/getDoctorsByQuery',
    getDoctorsByQuery
)

route.post('/updateDoctorProfile',
    [
        query('fullname').optional().notEmpty().withMessage('Full name is required'),
        query('email').optional().isEmail().withMessage('Valid email is required'),
        query('phone').optional().notEmpty().withMessage('Phone number is required'),
        query('country').optional().notEmpty().withMessage('Country is required'),
        query('city').optional().notEmpty().withMessage('City is required'),
        query('specialization').optional().notEmpty().withMessage('Specialization is required'),
        query('bio').optional(),
        query('categoryId').optional().notEmpty().withMessage('Category ID is required')
    ],
    upload.single('avatar'),
    verifyJWT,
    updateDoctorProfile
)

route.get('/getCategories',getCategories)

route.post('/addExperience',verifyJWT,addExperience);

route.post('/editExperience',verifyJWT,editExperience);

route.post('/deleteExperience',verifyJWT,deleteExperience);

route.post('/addEducation',verifyJWT,addEducation);

route.post('/editEducation',verifyJWT,editEducation);

route.post('/deleteEducation',verifyJWT,deleteEducation);

route.get('/getDoctorEducation',verifyJWT,getDoctorEducation);

route.get('/getDoctorExperience',verifyJWT,getDoctorExperience)

export default route;