import otpGenerator from 'otp-generator';
import { tranEmailApi } from '../app.js';
import Otp from '../models/otpModel.js';
const sendOtpMail = async (email) => {
    const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    try {
        const sender = {
            email: 'asjadabr40@gmail.com',
            name: 'Zenya'
        };
        const receivers = [{ email: email }];

        const response = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Verify Your OTP',
            htmlContent: `<p>Your OTP is ${otp}</p>`
        });

        const otpDocument = await Otp.findOne({ email });
        if (otpDocument) {
            await Otp.findByIdAndUpdate(otpDocument._id, {
                $set: { otp }
            }, { new: true })
        } else {
            await Otp.create({ email, otp });
        }
        return response;
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}

const sendMeetMail = async ({ patientEmail, meetLink }) => {
    try {
        console.log(meetLink)
        const sender = {
            email: 'asjadabr40@gmail.com',
            name: 'Zenya'
        };
        const receivers = [{ email: patientEmail }];
        const response = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Your Appointment Details',
            htmlContent: `<p>Your Google Meet link is: <a href="${meetLink}">${meetLink}</a></p>`
        });
        return response
    } catch (error) {
        console.error("Error creating Meet event:", error);
        throw error;
    }
}

export { sendOtpMail, sendMeetMail };