const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Skill = require('../models/Skill');

// POST /api/skills
router.post('/', auth, async (req, res) => {
    try {
        const {
            skillName, level, profession, projects,
            teachingLanguage, availableDates, availableTimes,
            meetupOk, mode, wantToLearn
        } = req.body;

        const skill = new Skill({
            user: req.user._id,
            skillName, level, profession,
            projects: projects || [],
            teachingLanguage,
            availableDates: availableDates || [],
            availableTimes: availableTimes || [],
            meetupOk: meetupOk || false,
            mode: mode || 'teach-only',
            wantToLearn: wantToLearn || [],
        });
        await skill.save();
        const populated = await skill.populate('user', '-password');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/skills/my — current user's skills
router.get('/my', auth, async (req, res) => {
    try {
        const skills = await Skill.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(skills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/skills  — all skills (public)
router.get('/', auth, async (req, res) => {
    try {
        const skills = await Skill.find({ isActive: true })
            .populate('user', '-password')
            .sort({ createdAt: -1 });
        res.json(skills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/skills/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const skill = await Skill.findOne({ _id: req.params.id, user: req.user._id });
        if (!skill) return res.status(404).json({ message: 'Skill not found' });
        Object.assign(skill, req.body);
        await skill.save();
        res.json(skill);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/skills/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const skill = await Skill.findOne({ _id: req.params.id, user: req.user._id });
        if (!skill) return res.status(404).json({ message: 'Skill not found' });
        skill.isActive = false;
        await skill.save();
        res.json({ message: 'Skill removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
