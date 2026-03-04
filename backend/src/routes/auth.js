const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP, sendOTPEmail, hasEmailConfig } = require('../utils/email');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email regex validator
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const generateToken = (id, isAdmin) =>
    jwt.sign({ id, isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/send-otp — Send OTP to email before signup
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });
        if (!isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address' });

        // Check if email already registered
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered. Please login.' });

        // Delete old OTPs for this email
        await OTP.deleteMany({ email });

        // Generate and save new OTP
        const otp = generateOTP();
        await OTP.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });

        // Send email only if it is the registered developer email
        let response = { message: 'OTP sent! Check your inbox.' };
        if (email === 'blue05phoenix@gmail.com') {
            await sendOTPEmail(email, otp);
        } else {
            // For any other email, auto-fill the OTP to bypass Resend free tier restrictions
            response.devOtp = otp;
            response.message = 'OTP generated! (Dev mode — auto-filled below)';
        }
        res.json(response);
    } catch (err) {
        console.error('OTP send error:', err.message);
        res.status(500).json({ message: 'Failed to send OTP. Ensure the email is valid.' });
    }
});

// POST /api/auth/verify-otp — Verify the OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

        const record = await OTP.findOne({ email, otp });
        if (!record) return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        if (record.expiresAt < new Date()) {
            await OTP.deleteMany({ email });
            return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
        }

        // Mark verified
        record.verified = true;
        await record.save();
        res.json({ message: 'Email verified successfully!', verified: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/signup — Create account (only after OTP verification)
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, phone, location, bio } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        // Check OTP verification (skip for admin email for convenience)
        if (email !== 'admin@gmail.com') {
            const otpRecord = await OTP.findOne({ email, verified: true });
            if (!otpRecord) {
                return res.status(400).json({ message: 'Please verify your email first with an OTP' });
            }
        }

        const isAdmin = email === 'admin@gmail.com';
        const user = new User({ name, email, password, phone, location, bio, isAdmin });
        await user.save();

        const token = generateToken(user._id, isAdmin);
        res.status(201).json({ token, user: user.toPublic(), isAdmin });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
        if (!isValidEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        if (!user.isActive) return res.status(401).json({ message: 'Account deactivated' });

        const match = await user.comparePassword(password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        user.lastActive = Date.now();
        await user.save();

        const token = generateToken(user._id, user.isAdmin);
        res.json({ token, user: user.toPublic(), isAdmin: user.isAdmin });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/google — Google OAuth Login/Signup
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({ message: 'Google OAuth is not configured on the server.' });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        let user = await User.findOne({ email });

        if (user) {
            // If user exists but doesn't have googleId linked
            if (!user.googleId) {
                user.googleId = googleId;
                if (!user.avatar) user.avatar = picture;
                await user.save();
            }
        } else {
            // Create new Google user
            user = new User({
                name,
                email,
                googleId,
                avatar: picture,
                isAdmin: email === 'admin@gmail.com'
            });
            await user.save();
        }

        if (!user.isActive) return res.status(401).json({ message: 'Account deactivated' });

        user.lastActive = Date.now();
        await user.save();

        const jwtToken = generateToken(user._id, user.isAdmin);
        res.status(200).json({ token: jwtToken, user: user.toPublic(), isAdmin: user.isAdmin });
    } catch (err) {
        console.error('Google Auth Error:', err.message);
        res.status(401).json({ message: 'Invalid Google token. Please try again.' });
    }
});

module.exports = router;
