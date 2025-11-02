const express = require('express');
const router = express.Router();
const Parking = require('../models/Parking');
const auth = require('../middleware/auth');

// ✅ Get all parking spots
router.get('/', async (req, res) => {
    try {
        const parkings = await Parking.find();
        res.json({
            success: true,
            count: parkings.length,
            data: parkings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ✅ Get parking by ID
router.get('/:id', async (req, res) => {
    try {
        const parking = await Parking.findById(req.params.id);
        if (!parking) {
            return res.status(404).json({
                success: false,
                message: 'Parking not found'
            });
        }
        res.json({
            success: true,
            data: parking
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ✅ Get parking by city
router.get('/city/:city', async (req, res) => {
    try {
        const parkings = await Parking.find({ city: req.params.city });
        res.json({
            success: true,
            count: parkings.length,
            data: parkings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ✅ Search parking
router.get('/search/:query', async (req, res) => {
    try {
        const parkings = await Parking.find({
            $or: [
                { name: { $regex: req.params.query, $options: 'i' } },
                { city: { $regex: req.params.query, $options: 'i' } }
            ]
        });
        res.json({
            success: true,
            count: parkings.length,
            data: parkings
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// ✅ Create parking (protected route)
router.post('/', auth, async (req, res) => {
    try {
        const parking = new Parking(req.body);
        const newParking = await parking.save();
        res.status(201).json({
            success: true,
            message: 'Parking created',
            data: newParking
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// ✅ Update parking (protected route)
router.put('/:id', auth, async (req, res) => {
    try {
        const parking = await Parking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!parking) {
            return res.status(404).json({
                success: false,
                message: 'Parking not found'
            });
        }
        res.json({
            success: true,
            message: 'Parking updated',
            data: parking
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
});

// ✅ Delete parking (protected route)
router.delete('/:id', auth, async (req, res) => {
    try {
        const parking = await Parking.findByIdAndDelete(req.params.id);
        if (!parking) {
            return res.status(404).json({
                success: false,
                message: 'Parking not found'
            });
        }
        res.json({
            success: true,
            message: 'Parking deleted'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
