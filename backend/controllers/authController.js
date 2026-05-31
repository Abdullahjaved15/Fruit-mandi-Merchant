import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Generate JWT token
const generateToken = ({ id, role }) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const authUser = async (req, res) => {
    const { email, password } = req.body;

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone || '',
            profileImage: user.profileImage || '',
            role: user.role,
            token: generateToken({ id: user._id, role: user.role }),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        phone: req.user.phone || '',
        profileImage: req.user.profileImage || '',
        role: req.user.role,
    });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const { username, email, phone, profileImage } = req.body;

    if (typeof req.user.save !== 'function') {
        // Handle dummy admin from .env
        return res.json({
            _id: req.user._id,
            username: username || req.user.username,
            email: email || process.env.ADMIN_EMAIL || 'admin@example.com',
            phone: phone || '',
            profileImage: profileImage || '',
            role: req.user.role,
            token: generateToken({ id: 'admin', role: 'admin' }),
        });
    }

    if (username) req.user.username = username;
    if (email) req.user.email = email.trim().toLowerCase();
    if (typeof phone === 'string') req.user.phone = phone;
    if (typeof profileImage === 'string') req.user.profileImage = profileImage;

    const updatedUser = await req.user.save();

    res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        profileImage: updatedUser.profileImage || '',
        role: updatedUser.role,
        token: generateToken({ id: updatedUser._id, role: updatedUser.role }),
    });
};

// @desc    Auth admin & get token (no public admin registration)
// @route   POST /api/auth/admin/login
// @access  Public (credential-gated)
export const authAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Trim for robust matching (esp. when values contain hidden trailing spaces/newlines)
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        // First, check the database for a user with 'admin' role
        const user = await User.findOne({ email: cleanEmail });
        if (user && user.role === 'admin' && (await user.matchPassword(cleanPassword))) {
            return res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken({ id: user._id, role: user.role }),
            });
        }

        // Second, fallback to environment variables
        const adminEmail = process.env.ADMIN_EMAIL?.trim();
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
        const adminPassword = process.env.ADMIN_PASSWORD?.trim();

        if (adminEmail && (adminPasswordHash || adminPassword)) {
            const emailOk = cleanEmail === adminEmail.toLowerCase();
            if (emailOk) {
                if (adminPasswordHash) {
                    const passwordOk = await bcrypt.compare(cleanPassword, adminPasswordHash);
                    if (passwordOk) {
                        return res.json({
                            _id: 'admin',
                            username: 'Admin',
                            email: adminEmail,
                            role: 'admin',
                            token: generateToken({ id: 'admin', role: 'admin' }),
                        });
                    }
                } else if (adminPassword) {
                    const a = Buffer.from(cleanPassword, 'utf8');
                    const b = Buffer.from(adminPassword, 'utf8');
                    const passwordOk = a.length === b.length && crypto.timingSafeEqual(a, b);
                    if (passwordOk) {
                        return res.json({
                            _id: 'admin',
                            username: 'Admin',
                            email: adminEmail,
                            role: 'admin',
                            token: generateToken({ id: 'admin', role: 'admin' }),
                        });
                    }
                }
            }
        }

        res.status(401).json({ message: 'Invalid email or password' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during admin authentication' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { username, email, password, phone } = req.body;

    const cleanEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: cleanEmail });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Force role to 'user' for public registration
    const user = await User.create({
        username,
        email: cleanEmail,
        password,
        phone: phone ?? '',
        role: 'user', 
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone || '',
            profileImage: user.profileImage || '',
            role: user.role,
            token: generateToken({ id: user._id, role: user.role }),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};
