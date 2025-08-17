import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import mongoDb from "./db/index.js";
import router from "./routes/index.js";
import sgMail from "@sendgrid/mail";
import { slotManager } from "./utils/slotManager.js";
import Stripe from "stripe";
import Sib from 'sib-api-v3-sdk'
import confirmAppointment from "./utils/confirmAppointment.js";
dotenv.config();
const app = express();


app.use('/api/stripe/webhook', bodyParser.raw({ type: 'application/json' }), confirmAppointment);

app.use(cors({
  origin: `${process.env.CLIENT_URL}`,
  credentials: true,
   allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());


mongoDb();

app.listen(process.env.PORT, () => {
  console.log(`Server is running at ${process.env.PORT}`)
})
const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use('/api', router)
slotManager();

export { app, sgMail, stripe, tranEmailApi }