const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillName: { type: String, required: true },
    level: { type: String, enum: ['Basic', 'Moderate', 'Mid', 'Advanced', 'Expert'], required: true },
    profession: { type: String, enum: ['Student', 'Teacher', 'Developer', 'Freelancer', 'Other'], required: true },
    projects: [{ type: String }],
    teachingLanguage: { type: String, required: true },
    availableDates: [{ type: String }],
    availableTimes: [{ type: String }],
    meetupOk: { type: Boolean, default: false },
    mode: { type: String, enum: ['teach-only', 'teach-learn'], default: 'teach-only' },
    wantToLearn: [{ type: String }],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
