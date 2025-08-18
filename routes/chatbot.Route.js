import express from 'express';
import { getInfo } from '../controllers/chatbotControllers.js';

const route = express.Router();

route.post('/new',getInfo);

export default route;