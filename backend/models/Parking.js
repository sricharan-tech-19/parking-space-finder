const mongoose = require('mongoose');

const parkingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        enum: ['Bangalore', 'Chennai']
    },
    coords: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    availability: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    price: {
        type: String,
        required: true
    },
    hours: {
        type: String,
        required: true,
        default: '24/7'
    },
    description: { type: String },
    amenities: [String],
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    reviews: [{
        userId: mongoose.Schema.Types.ObjectId,
        userName: String,
        text: String,
        rating: Number,
        createdAt: { type: Date, default: Date.now }
    }],
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Parking', parkingSchema);

