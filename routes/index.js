import express from 'express';
import authRouter from './auth.Route.js'
import userRouter from './user.Route.js'
import doctorRouter from './doctor.Route.js';
import appointmentRouter from './appointment.Route.js';
import reviewRouter from './review.Route.js';
import adminRouter from './admin.Route.js';
import paymentRouter from './payment.Route.js';
import chatbotRouter from './chatbot.Route.js';

const route = express.Router();

route.use('/auth',authRouter);
route.use('/user',userRouter);
route.use('/doctor',doctorRouter);
route.use('/appointment',appointmentRouter);
route.use('/review',reviewRouter);
route.use('/admin',adminRouter);
route.use('/payment',paymentRouter);
route.use('/chatbot',chatbotRouter)
// route.use('/stripe',webhookRouter)



export default route;