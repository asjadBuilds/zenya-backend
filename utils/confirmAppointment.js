import mongoDb from "../db/index.js";
import Appointment from "../models/appointmentModel.js";
import stripe from "stripe";
import createMeetEvent from "./createMeetEvent.js";
import ApiError from "./ApiError.js";
import { sendMeetMail } from "./mailGenerator.js";
const confirmAppointment = async (req, res) => {
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
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const customerEmail = session.customer_email;
        const appointmentId = session.metadata?.appointmentId;
        const doctorName = session.metadata?.doctorName;
        const fees = session.metadata?.fees;
        console.log('✅ Payment Success for appointment:', appointmentId);
        mongoDb();
        const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
            $set: { status: "CONFIRMED" }
        }).populate('patientId')
            .populate('doctorId')
        const meetEvent = await createMeetEvent({
            doctorName,
            dateTime: appointment.dateTime,
            patientEmail: appointment?.patientId?.email,
            doctorEmail: appointment?.doctorId?.email,
            googleRefreshToken: appointment?.doctorId?.googleRefreshToken
        });
        if (!meetEvent) throw new ApiError(500, "Meet Error Failed to Create");
        appointment.meetUrl = meetEvent
        await appointment.save({ validateBeforeSave: false });
        const emailResponse = await sendMeetMail({ patientEmail: appointment?.patientId?.email, meetLink:meetEvent })
        if (!emailResponse) throw new ApiError(500, "Meet Email Failed to send")
    }

    res.sendStatus(200);
}

export default confirmAppointment