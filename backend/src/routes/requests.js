const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Request = require('../models/Request');
const User = require('../models/User');

// POST /api/requests — send a request
router.post('/', auth, async (req, res) => {
    try {
        const { toUser, skill, message } = req.body;
        if (toUser === req.user._id.toString())
            return res.status(400).json({ message: 'Cannot send request to yourself' });

        const existing = await Request.findOne({
            fromUser: req.user._id, toUser, skill, status: 'pending'
        });
        if (existing) return res.status(400).json({ message: 'Request already sent' });

        const request = new Request({ fromUser: req.user._id, toUser, skill, message });
        await request.save();
        await request.populate([
            { path: 'fromUser', select: '-password' },
            { path: 'toUser', select: '-password' },
            { path: 'skill' },
        ]);
        res.status(201).json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/requests — inbox and sent
router.get('/', auth, async (req, res) => {
    try {
        const { type } = req.query; // 'inbox' | 'sent' | undefined (all)
        let filter = {};
        if (type === 'inbox') filter = { toUser: req.user._id };
        else if (type === 'sent') filter = { fromUser: req.user._id };
        else filter = { $or: [{ fromUser: req.user._id }, { toUser: req.user._id }] };

        const requests = await Request.find(filter)
            .populate('fromUser', '-password')
            .populate('toUser', '-password')
            .populate('skill')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/requests/:id — accept or reject
router.put('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'rejected'].includes(status))
            return res.status(400).json({ message: 'Invalid status' });

        const request = await Request.findOne({ _id: req.params.id, toUser: req.user._id });
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status;
        await request.save();
        await request.populate([
            { path: 'fromUser', select: '-password' },
            { path: 'toUser', select: '-password' },
            { path: 'skill' },
        ]);
        res.json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
