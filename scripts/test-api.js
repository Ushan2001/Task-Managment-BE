const mongoose = require('mongoose');
const { spawn } = require('child_process');
require('dotenv').config();

const PORT = 5001; // Use separate port for tests
const API_URL = `http://localhost:${PORT}/api`;

const testEmails = {
    admin: 'test.admin@tasktest.com',
    user: 'test.user@tasktest.com'
};

const runTests = async () => {
    console.log('Starting Test Server...');
    const serverProcess = spawn('node', ['server.js'], {
        env: { ...process.env, PORT: PORT.toString() }
    });

    serverProcess.stdout.on('data', (data) => {
        console.log(`[Server]: ${data.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`[Server Error]: ${data.toString().trim()}`);
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 3000));

    let adminToken = '';
    let userToken = '';
    let adminUserId = '';
    let userUserId = '';
    let task1Id = '';
    let task2Id = '';

    try {
        console.log('\n--- 1. Testing Base Endpoint ---');
        const baseRes = await fetch(`http://localhost:${PORT}/`);
        const baseData = await baseRes.json();
        console.log('GET / -> Status:', baseRes.status, 'Body:', baseData);
        if (!baseData.success) throw new Error('Base endpoint test failed');

        console.log('\n--- 2. Testing User Signup ---');
        // Signup Admin
        const adminSignupRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Admin',
                email: testEmails.admin,
                password: 'password123',
                role: 'Admin'
            })
        });
        const adminSignupData = await adminSignupRes.json();
        console.log('POST /auth/signup (Admin) -> Status:', adminSignupRes.status, 'Message:', adminSignupData.message);
        if (adminSignupRes.status !== 201) throw new Error('Admin signup failed: ' + JSON.stringify(adminSignupData));
        adminToken = adminSignupData.data.token;
        adminUserId = adminSignupData.data.user._id;

        // Signup User
        const userSignupRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: testEmails.user,
                password: 'password123',
                role: 'User'
            })
        });
        const userSignupData = await userSignupRes.json();
        console.log('POST /auth/signup (User) -> Status:', userSignupRes.status, 'Message:', userSignupData.message);
        if (userSignupRes.status !== 201) throw new Error('User signup failed: ' + JSON.stringify(userSignupData));
        userToken = userSignupData.data.token;
        userUserId = userSignupData.data.user._id;

        console.log('\n--- 3. Testing Signin ---');
        const signinRes = await fetch(`${API_URL}/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmails.user,
                password: 'password123'
            })
        });
        const signinData = await signinRes.json();
        console.log('POST /auth/signin -> Status:', signinRes.status, 'Success:', signinData.success);
        if (signinRes.status !== 200) throw new Error('Signin failed');

        console.log('\n--- 4. Testing User List Fetch ---');
        const usersListRes = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const usersListData = await usersListRes.json();
        console.log('GET /users -> Status:', usersListRes.status, 'Count:', usersListData.data.users.length);
        if (usersListRes.status !== 200) throw new Error('Users fetch failed');

        console.log('\n--- 5. Testing Task Creation ---');
        // Task 1 created by Admin, assigned to User
        const task1Res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                title: 'Admin Created Task',
                description: 'Verify role visibility',
                priority: 'High',
                assignedTo: userUserId
            })
        });
        const task1Data = await task1Res.json();
        console.log('POST /tasks (Task 1) -> Status:', task1Res.status, 'Task Title:', task1Data.data.task.title);
        if (task1Res.status !== 201) throw new Error('Task 1 creation failed');
        task1Id = task1Data.data.task._id;

        // Task 2 created by User, assigned to User
        const task2Res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                title: 'User Created Task',
                description: 'Only creator can delete',
                priority: 'Medium',
                assignedTo: userUserId
            })
        });
        const task2Data = await task2Res.json();
        console.log('POST /tasks (Task 2) -> Status:', task2Res.status, 'Task Title:', task2Data.data.task.title);
        if (task2Res.status !== 201) throw new Error('Task 2 creation failed');
        task2Id = task2Data.data.task._id;

        console.log('\n--- 6. Testing Role-Based Task Fetching ---');
        // Fetch as Admin (should see both tasks)
        const adminTasksRes = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const adminTasksData = await adminTasksRes.json();
        console.log('GET /tasks (Admin) -> Status:', adminTasksRes.status, 'Count:', adminTasksData.data.tasks.length);
        if (adminTasksData.data.tasks.length < 2) throw new Error('Admin should see at least 2 tasks');

        // Fetch as User (should see both if assigned, let's verify)
        const userTasksRes = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const userTasksData = await userTasksRes.json();
        console.log('GET /tasks (User) -> Status:', userTasksRes.status, 'Count:', userTasksData.data.tasks.length);

        console.log('\n--- 7. Testing Task Edit & Access Control ---');
        // User updates task 1 status
        const updateTaskRes = await fetch(`${API_URL}/tasks/${task1Id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                status: 'In Progress'
            })
        });
        const updateTaskData = await updateTaskRes.json();
        console.log('PUT /tasks/:id -> Status:', updateTaskRes.status, 'New Status:', updateTaskData.data.task.status);
        if (updateTaskRes.status !== 200 || updateTaskData.data.task.status !== 'In Progress') throw new Error('Task update failed');

        console.log('\n--- 8. Testing Task Deletion Permissions ---');
        // User deletes Admin task (should be 403 Forbidden since User is assignee but not creator)
        const deleteForbiddenRes = await fetch(`${API_URL}/tasks/${task1Id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        console.log('DELETE /tasks/:id (Forbidden check) -> Status:', deleteForbiddenRes.status);
        if (deleteForbiddenRes.status !== 403) throw new Error('Should have returned 403 Forbidden');

        // Admin deletes Admin task (should succeed)
        const deleteAdminRes = await fetch(`${API_URL}/tasks/${task1Id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log('DELETE /tasks/:id (Admin delete Admin task) -> Status:', deleteAdminRes.status);
        if (deleteAdminRes.status !== 200) throw new Error('Admin task deletion failed');

        // User deletes User task (should succeed)
        const deleteUserRes = await fetch(`${API_URL}/tasks/${task2Id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        console.log('DELETE /tasks/:id (User delete User task) -> Status:', deleteUserRes.status);
        if (deleteUserRes.status !== 200) throw new Error('User task deletion failed');

        console.log('\n>>> ALL INTEGRATION TESTS PASSED SUCCESSFULLY! <<<');

    } catch (error) {
        console.error('\n>>> TEST SUITE ENCOUNTERED ERRORS: <<<', error);
    } finally {
        console.log('\nCleaning up Database Records...');
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            const User = require('../models/User');
            const Task = require('../models/Task');

            // Delete test users and any tasks associated with them
            const testUsers = await User.find({ email: { $in: [testEmails.admin, testEmails.user] } });
            const testUserIds = testUsers.map(u => u._id);

            await Task.deleteMany({
                $or: [
                    { createdBy: { $in: testUserIds } },
                    { assignedTo: { $in: testUserIds } }
                ]
            });
            await User.deleteMany({ _id: { $in: testUserIds } });
            
            console.log('Cleanup finished successfully.');
        } catch (cleanupError) {
            console.error('Database cleanup failed:', cleanupError);
        } finally {
            await mongoose.disconnect();
        }

        console.log('Stopping Test Server...');
        serverProcess.kill();
        process.exit(0);
    }
};

runTests();
