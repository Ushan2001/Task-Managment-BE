const User = require('../models/User');
const { generateToken } = require('../helpers/auth-middleware');
const { validateSignupData, validateSigninData } = require('../helpers/validation');

const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const validation = validateSignupData({ name, email, password, role });

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: role || 'User'
        });

        await newUser.save();

        const token = generateToken(newUser._id, newUser.email, newUser.role);

        // Fetch user again to return user without password
        const userResponse = await User.findById(newUser._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
};

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const validation = validateSigninData({ email, password });

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user._id, user.email, user.role);

        const userResponse = await User.findById(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                user
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile',
            error: error.message
        });
    }
};

module.exports = {
    signup,
    signin,
    getProfile
};
