const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    audioData: { type: String },
    read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
