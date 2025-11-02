const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// ✅ Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('favorites');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Add to favorites
router.post('/favorites/add/:parkingId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user.favorites.includes(req.params.parkingId)) {
            user.favorites.push(req.params.parkingId);
            await user.save();
        }
        res.json({ success: true, message: 'Added to favorites', data: user.favorites });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Remove from favorites
router.post('/favorites/remove/:parkingId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        user.favorites = user.favorites.filter(id => id.toString() !== req.params.parkingId);
        await user.save();
        res.json({ success: true, message: 'Removed from favorites', data: user.favorites });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ✅ Get favorites
router.get('/favorites', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('favorites');
        res.json({ success: true, count: user.favorites.length, data: user.favorites });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
