import express from 'express'
import { bookAppointment, getDoctorAppointments, getTodayDocAppointments, getUserAppointments, markAppointmentAsCompleted, resheduleAppointment, updateAppointmentFees, updateAppointmentSlots, updateAppointmentStatus } from '../controllers/appointmentControllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { query } from 'express-validator';

const route = express.Router();

route.get('/getUserAppointments',verifyJWT,getUserAppointments);

route.get('/getDoctorAppointments',verifyJWT,getDoctorAppointments);

route.get('/getTodayDocAppointments',verifyJWT, getTodayDocAppointments)

route.post('/bookAppointment',
    [
        query('doctorId').notEmpty().withMessage('Doctor ID is required'),
        query('dateTime').notEmpty().withMessage('Date and time are required')
    ],
    verifyJWT,
    bookAppointment
)

route.post('/markAppointmentAsCompleted',
    [
        query('appointmentId').notEmpty().withMessage('Appointment ID is required'),
        query('status').notEmpty().withMessage('Status is required')
    ],
    verifyJWT,
    markAppointmentAsCompleted
)

route.post('/rescheduleAppointment',
    [
        query('appointmentId').notEmpty().withMessage('Appointment ID is required'),
        query('dateTime').notEmpty().withMessage('New date and time are required')
    ],
    verifyJWT,
    resheduleAppointment
)

route.post('/updateAppointmentFees',
    [
        query('fees').notEmpty().withMessage('Fees are required'),
    ],
    verifyJWT,
    updateAppointmentFees
)

route.post('/updateAppointmentSlots',
    [
        query('slots').isArray().withMessage('Slots must be an array'),
    ],
    verifyJWT,
    updateAppointmentSlots
)

route.post('/updateAppointmentStatus',verifyJWT,updateAppointmentStatus);

export default route;