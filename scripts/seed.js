const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Task = require('../models/Task');

const seedData = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected.');

        // Clean existing test data (only tests, keeping actual data intact if any, but this is a test db)
        console.log('Cleaning up existing seed users and tasks...');
        const targetEmails = ['admin@apexflow.com', 'user@apexflow.com'];
        const existingUsers = await User.find({ email: { $in: targetEmails } });
        const userIds = existingUsers.map(u => u._id);
        
        await Task.deleteMany({
            $or: [
                { createdBy: { $in: userIds } },
                { assignedTo: { $in: userIds } }
            ]
        });
        await User.deleteMany({ _id: { $in: userIds } });

        console.log('Creating Admin account...');
        const adminUser = new User({
            name: 'Apex Admin',
            email: 'admin@apexflow.com',
            password: 'password123',
            role: 'Admin'
        });
        await adminUser.save();
        console.log('Admin account created (admin@apexflow.com / password123)');

        console.log('Creating User account...');
        const normalUser = new User({
            name: 'Jane User',
            email: 'user@apexflow.com',
            password: 'password123',
            role: 'User'
        });
        await normalUser.save();
        console.log('User account created (user@apexflow.com / password123)');

        console.log('Creating seed tasks...');
        const task1 = new Task({
            title: 'Verify Dashboard Setup',
            description: 'Check layout responsiveness and test menu expands/collapses.',
            priority: 'High',
            status: 'Open',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
            createdBy: adminUser._id,
            assignedTo: normalUser._id
        });
        await task1.save();

        const task2 = new Task({
            title: 'Build Shadcn Form Elements',
            description: 'Integrate select menus, dialogue boxes, and input styles.',
            priority: 'Medium',
            status: 'In Progress',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
            createdBy: adminUser._id,
            assignedTo: adminUser._id
        });
        await task2.save();

        const task3 = new Task({
            title: 'Review Database Queries',
            description: 'Audit indices and compound keys in mongoose schemas.',
            priority: 'Low',
            status: 'Done',
            dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // yesterday
            createdBy: normalUser._id,
            assignedTo: normalUser._id
        });
        await task3.save();

        console.log('Seed tasks created successfully.');
        console.log('Seeding complete!');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
        process.exit(0);
    }
};

seedData();
