import express from 'express';
import bodyParser from 'body-parser';
import { updateAppointmentStatus } from '../controllers/appointmentControllers.js';
const route = express.Router();

route.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    console.log('webhook called')
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log('⚠️ Webhook signature verification failed.', err.message);
    return res.sendStatus(400);
  }

  // ✅ Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_email;
    const appointmentId = session.metadata?.appointmentId;

    // 👉 Call your DB to update appointment status
    console.log('✅ Payment Success for appointment:', appointmentId);
    // await updateAppointmentStatus(appointmentId, 'paid');
    await updateAppointmentStatus(appointmentId, 'CONFIRMED')
  }

  res.sendStatus(200);
});

export default route;