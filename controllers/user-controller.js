const User = require('../models/User');

const getUsers = async (req, res) => {
    try {
        // Return id, name, email, and role for all users to help select assignedTo in task forms
        const users = await User.find({}, '_id name email role');
        
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users',
            error: error.message
        });
    }
};

module.exports = {
    getUsers
};
