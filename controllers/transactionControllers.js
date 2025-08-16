import AsyncHandler from '../utils/AsyncHandler.js'
import { stripe } from '../app.js';
import ApiResponse from '../utils/ApiResponse.js';
const createCheckoutSession = AsyncHandler(async (req, res) => {
    const { doctorId, doctorName, fee, appointmentId } = req.body;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'pkr',
                    product_data: {
                        name: `Consultation with Dr. ${doctorName}`,
                    },
                    unit_amount: fee * 100, // $50 becomes 5000 cents
                },
                quantity: 1,
            },
        ],
        success_url: `${process.env.CLIENT_URL}/paymentSuccess?session_id={CHECKOUT_SESSION_ID}&appointmentId=${appointmentId}`,
        cancel_url: `${process.env.CLIENT_URL}/`,
        metadata: {
            doctorName,
            doctorId,
            appointmentId,
            fee
        },
    });
    res.status(201).json(new ApiResponse(201, { url: session.url }))
})


export { createCheckoutSession }