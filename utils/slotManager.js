import nodeCron from "node-cron";
import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";

// Runs every 60 minutes

const slotManager = () => {
    nodeCron.schedule("0 0 * * *", async () => {
        console.log("Running slot auto-unbook job");

        const expiredAppointments = await Appointment.find({
            status: { $ne: "COMPLETED" },
            dateTime: { $lt: new Date() }
        }).populate('doctorId');

        for (const appointment of expiredAppointments) {
            appointment.status = "COMPLETED";
            await appointment.save();
            const doctor = await Doctor.findById(appointment.doctorId);
            if (!doctor) continue;

            const slotIndex = doctor.availableSlots.findIndex(slot =>
                new Date(slot.dateTime).getTime() === new Date(appointment.dateTime).getTime()
            );

            if (slotIndex !== -1 && doctor.availableSlots[slotIndex].isBooked) {
                doctor.availableSlots[slotIndex].isBooked = false;
                await doctor.save();
                console.log(`Unbooked slot for doctor ${doctor._id} at ${appointment.dateTime}`);
            }
        }
    });
}
export  {slotManager};