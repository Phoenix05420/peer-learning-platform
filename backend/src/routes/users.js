const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Skill = require('../models/Skill');

// GET /api/users/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/users/me
router.put('/me', auth, async (req, res) => {
    try {
        const { name, phone, location, bio, avatar, currentPassword, newPassword } = req.body;

        let user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (newPassword) {
            if (user.password) {
                if (!currentPassword) return res.status(400).json({ message: 'Current password is required to set a new one' });
                const isMatch = await user.comparePassword(currentPassword);
                if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });
            }
            if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
            user.password = newPassword;
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.location = location || user.location;
        user.bio = bio !== undefined ? bio : user.bio;
        user.avatar = avatar || user.avatar;
        user.lastActive = Date.now();

        await user.save();
        const updatedUser = await User.findById(user._id).select('-password');
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/users/feed  - get all users with skills, supports filters
router.get('/feed', auth, async (req, res) => {
    try {
        const {
            skill, level, language, meetup, mode,
            profession, search, location, date, time
        } = req.query;

        // Build skill filter
        const skillFilter = { isActive: true };
        if (skill) skillFilter.skillName = { $regex: skill, $options: 'i' };
        if (level) skillFilter.level = level;
        if (language) skillFilter.teachingLanguage = { $regex: language, $options: 'i' };
        if (meetup === 'true') skillFilter.meetupOk = true;
        if (mode) skillFilter.mode = mode;
        if (profession) skillFilter.profession = profession;
        if (date) skillFilter.availableDates = date;
        if (time) skillFilter.availableTimes = time;

        const skills = await Skill.find(skillFilter)
            .populate('user', '-password')
            .sort({ createdAt: -1 });

        // Group by user, filter out self and inactive
        const userMap = {};
        for (const s of skills) {
            if (!s.user || s.user._id.toString() === req.user._id.toString()) continue;
            if (!s.user.isActive) continue;
            const uid = s.user._id.toString();
            if (!userMap[uid]) userMap[uid] = { user: s.user, skills: [] };
            userMap[uid].skills.push(s);
        }

        let result = Object.values(userMap);

        // Optional text search on user name/location
        if (search) {
            result = result.filter(r =>
                r.user.name.toLowerCase().includes(search.toLowerCase()) ||
                (r.user.location || '').toLowerCase().includes(search.toLowerCase())
            );
        }

        // Location filter
        if (location) {
            result = result.filter(r =>
                (r.user.location || '').toLowerCase().includes(location.toLowerCase())
            );
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/users/:id
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        const skills = await Skill.find({ user: req.params.id, isActive: true });
        res.json({ user, skills });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
