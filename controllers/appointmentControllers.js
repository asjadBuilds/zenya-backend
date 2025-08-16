import Appointment from '../models/appointmentModel.js';
import Doctor from '../models/doctorModel.js';
import { validationResult } from 'express-validator';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

const getUserAppointments = AsyncHandler(async (req, res) => {
    const appointments = await Appointment.find({ patientId: req.user._id }).populate('doctorId').sort({ _id: -1 });
    res
        .status(200)
        .json(new ApiResponse(200, appointments, "User appointments fetched successfully"));
})

const getDoctorAppointments = AsyncHandler(async (req, res) => {
    // const appointments = await Appointment.find({ doctorId: req.user._id }).populate('patientId').sort({ _id: -1 });
    // res
    //     .status(200)
    //     .json(new ApiResponse(200, appointments, "Doctor appointments fetched successfully"));
    let {
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "desc",
      search = "",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Build match conditions
    const match = {};
    match.doctorId = req?.user?._id

    // Aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: "users", // collection name in MongoDB
          localField: "patientId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" }
    ];

    // Add search
    if (search) {
      match.$or = [
        { "userId.username": { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } }
      ];
    }

    pipeline.push({ $match: match });

    // Count total before pagination
    const totalResult = await Appointment.aggregate([
      ...pipeline,
      { $count: "count" }
    ]);
    const total = totalResult[0]?.count || 0;

    // Add sort, skip, limit
    pipeline.push({ $sort: sort }, { $skip: skip }, { $limit: limit });

    // Select only needed fields
    pipeline.push({
      $project: {
        _id: 1,
        dateTime: 1,
        status: 1,
        meetUrl: 1,
        "user.username": 1
      }
    });

    const data = await Appointment.aggregate(pipeline);

    res.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
})

const getTodayDocAppointments = AsyncHandler(async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); 

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); 

    const appointments = await Appointment.find({
        doctorId: req.user._id,
        dateTime: { $gte: startOfDay, $lte: endOfDay } 
    })
        .populate('patientId')
        .sort({ _id: -1 });

    res.status(200).json(
        new ApiResponse(200, appointments, "Today's doctor appointments fetched successfully")
    );
})

const bookAppointment = AsyncHandler(async (req, res) => {
    const { doctorId, dateTime } = req.body;
    const result = validationResult(req.body);
    if (!result.isEmpty()) throw new ApiError(402, "Invalid appointment details");
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new ApiError(404, "Doctor not found");
    const appointmentDateTime = new Date(dateTime);
    const availableSlot = doctor.availableSlots.findIndex(slot =>
        new Date(slot.dateTime).getTime() === appointmentDateTime.getTime() && slot.isBooked === false
    )
    if (availableSlot === -1) throw new ApiError(400, "No Available slots for this date and time");
    doctor.availableSlots[availableSlot].isBooked = true;
    await doctor.save();
    const apointment = await Appointment.create({
        doctorId,
        patientId: req.user._id,
        dateTime: appointmentDateTime,
        status: 'PENDING'
    })
    res
        .status(201)
        .json(new ApiResponse(201, apointment, "Appointment booked successfully"));
})

const markAppointmentAsCompleted = AsyncHandler(async (req, res) => {
    const { appointmentId, status } = req.body;
    const result = validationResult(req.body);
    if (!result.isEmpty()) throw new ApiError(402, "Invalid appointment ID");
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new ApiError(404, "Appointment not found");
    appointment.status = status;
    await appointment.save();
    if (status === 'COMPLETED') {
        const doctor = await Doctor.findOne({ _id: appointment.doctorId });
        if (!doctor) throw new ApiError(404, "Doctor not found");
        const slotIndex = doctor.availableSlots.findIndex(slot =>
            new Date(slot.DateTime).getTime() === new Date(appointment.dateTime).getTime() && slot.isBooked === true
        )
        if (slotIndex !== -1) {
            doctor.availableSlots[slotIndex].isBooked = false;
            await doctor.save();
        }
    }
    res
        .status(200)
        .json(new ApiResponse(200, appointment, "Appointment status updated successfully"));
})

const resheduleAppointment = AsyncHandler(async (req, res) => {
    const { appointmentId, dateTime } = req.body;
    const result = validationResult(req);
    if (!result.isEmpty()) throw new ApiError(400, "Invalid Appointment Credentials");
    const appointment = await Appointment.findById(appointmentId);
    const doctor = await Doctor.findOne({ _id: appointment.doctorId });
    if (!doctor) throw new ApiError(404, "Doctor not found");
    const slotIndex = doctor.availableSlots.findIndex(slot =>
        new Date(slot.DateTime).getTime() === new Date(dateTime).getTime() && slot.isBooked === false
    )
    if (slotIndex === -1) throw new ApiError(400, "No Slots available")
    doctor.availableSlots[slotIndex].isBooked = true;
    await doctor.save();
    await Appointment.findByIdAndUpdate(appointment._id, {
        $set: {
            dateTime
        }
    }, { new: true })

    res
        .status(200)
        .json(new ApiResponse(200, "Appointment Rescheduled Successfully"));
})

//under development
const CancelAppointment = AsyncHandler(async (req, res) => {
    const { appointmentId } = req.body;
    const result = validationResult(req.body);
    if (!result.isEmpty()) throw new ApiError(400, "Invalid Appointment Credentials");

})

const updateAppointmentFees = AsyncHandler(async (req, res) => {
    const { fees } = req.body;
    const result = validationResult(req.body);
    if (!result.isEmpty()) throw new ApiError(400, "Invalid Appointment Credentials");
    await Doctor.findByIdAndUpdate(req.user._id, {
        $set: {
            appointmentFees: fees,
        }
    }, { new: true });
    res
        .status(200)
        .json(new ApiResponse(200, "Appointment fees updated successfully"));
})

const updateAppointmentSlots = AsyncHandler(async (req, res) => {
    const { slots } = req.body;
    const result = validationResult(req);
    if (result.isEmpty()) throw new ApiError(400, "Validation error");
    if (!Array.isArray(slots)) throw new ApiError(400, "Slots must be an array");

    const updateFields = slots.map(slot => ({
        dateTime: slot,
    }));

    const doctor = await Doctor.findByIdAndUpdate(req.user._id, {
        $set: { availableSlots: updateFields }
    }, { new: true });

    res
        .status(200)
        .json(new ApiResponse(200, doctor, "Appointment slots updated successfully"));
})

const updateAppointmentStatus = AsyncHandler(async (req, res) => {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
        $set: { status }
    }, { new: true });
    res
        .status(200)
        .json({ message: "Status Changed Successfully" })
})


export {
    getUserAppointments,
    getDoctorAppointments,
    bookAppointment,
    markAppointmentAsCompleted,
    resheduleAppointment,
    updateAppointmentFees,
    updateAppointmentSlots,
    updateAppointmentStatus,
    getTodayDocAppointments
}