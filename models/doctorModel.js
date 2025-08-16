import mongoose from "mongoose"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const doctorSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    specialization: [{
        type: String,
        required: true
    }],
    bio: {
        type: String,
    },
    avatar: {
        type: String,
        required: true
    },
    experience: [{
        role: { type: String },
        instituteName: { type: String },
        startDate: { type: Date },
        endDate: { type: String }
    }],
    education: [{
        degreeName: { type: String },
        instituteName: { type: String },
        startDate: { type: Date },
        endDate: { type: String }
    }],
    isVerified: {
        type: Boolean,
        default: false
    },
    availableSlots: [{
        dateTime: { type: Date },
        isBooked: { type: Boolean, default: false }
    }],
    appointmentFees: {
        type: String,
    },
    currency: {
        type: String,
    },
    refreshToken: {
        type: String
    },
    googleRefreshToken:{
        type:String
    }
}, { timestamps: true });

doctorSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

doctorSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

doctorSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.fullname,
            password: this.password,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

doctorSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;