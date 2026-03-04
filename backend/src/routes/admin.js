const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Request = require('../models/Request');

// GET /api/admin/users — all users with their activity
router.get('/users', auth, adminCheck, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        const result = await Promise.all(users.map(async (user) => {
            const skillCount = await Skill.countDocuments({ user: user._id });
            const requestsSent = await Request.countDocuments({ fromUser: user._id });
            const requestsReceived = await Request.countDocuments({ toUser: user._id });
            const acceptedConnections = await Request.countDocuments({
                $or: [{ fromUser: user._id }, { toUser: user._id }],
                status: 'accepted'
            });
            return {
                ...user.toObject(),
                activity: { skillCount, requestsSent, requestsReceived, acceptedConnections }
            };
        }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/admin/users/:id — deactivate user
router.delete('/users/:id', auth, adminCheck, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.isAdmin) return res.status(400).json({ message: 'Cannot remove admin' });

        user.isActive = false;
        await user.save();
        res.json({ message: 'User deactivated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/admin/stats
router.get('/stats', auth, adminCheck, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ isAdmin: false });
        const activeUsers = await User.countDocuments({ isAdmin: false, isActive: true });
        const totalSkills = await Skill.countDocuments({ isActive: true });
        const totalRequests = await Request.countDocuments();
        const acceptedRequests = await Request.countDocuments({ status: 'accepted' });
        res.json({ totalUsers, activeUsers, totalSkills, totalRequests, acceptedRequests });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
