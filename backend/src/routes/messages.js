const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Request = require('../models/Request');

// GET /api/messages/:requestId
router.get('/:requestId', auth, async (req, res) => {
    try {
        const request = await Request.findById(req.params.requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const isParticipant =
            request.fromUser.toString() === req.user._id.toString() ||
            request.toUser.toString() === req.user._id.toString();
        if (!isParticipant) return res.status(403).json({ message: 'Forbidden' });

        const messages = await Message.find({ request: req.params.requestId })
            .populate('sender', '-password')
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/messages/:requestId
router.post('/:requestId', auth, async (req, res) => {
    try {
        const { text, audioData } = req.body;
        const request = await Request.findById(req.params.requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.status !== 'accepted')
            return res.status(400).json({ message: 'Request not accepted yet' });

        const isParticipant =
            request.fromUser.toString() === req.user._id.toString() ||
            request.toUser.toString() === req.user._id.toString();
        if (!isParticipant) return res.status(403).json({ message: 'Forbidden' });

        const message = new Message({ request: req.params.requestId, sender: req.user._id, text, audioData });
        await message.save();
        await message.populate('sender', '-password');
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
