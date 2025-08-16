import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    doctorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doctor',
        required:true
    },
    patientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    dateTime:{
        type:Date,
        required:true
    },
    status:{
        type:String,
        enum:['PENDING','CONFIRMED','CANCELLED','COMPLETED']
    },
    meetUrl:{
        type:String
    }
    
},{timestamps:true});

const Appointment = mongoose.model('Appointment',appointmentSchema);
export default Appointment;