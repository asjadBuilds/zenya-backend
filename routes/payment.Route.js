import express from 'express';
import { createCheckoutSession } from '../controllers/transactionControllers.js';

const route = express.Router();

route.post('/createCheckoutSession',createCheckoutSession);

export default route;