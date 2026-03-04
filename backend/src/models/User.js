const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // Optional for Google Auth users
  googleId: { type: String },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
