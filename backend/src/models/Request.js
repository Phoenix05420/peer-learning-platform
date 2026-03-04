const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    message: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
