const Task = require('../models/Task');
const { validateTaskData } = require('../helpers/validation');

const createTask = async (req, res) => {
    try {
        const { title, description, priority, status, dueDate, assignedTo } = req.body;

        const validation = validateTaskData({ title, description, priority, status, dueDate });

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const task = new Task({
            title,
            description,
            priority: priority || 'Medium',
            status: status || 'Open',
            dueDate: dueDate || undefined,
            assignedTo: assignedTo || undefined,
            createdBy: req.user.userId
        });

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role');

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: {
                task: populatedTask
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during task creation',
            error: error.message
        });
    }
};

const getTasks = async (req, res) => {
    try {
        const { search, priority, status, assignedTo } = req.query;

        // Build base query
        const query = {};

        // Role-based scoping
        if (req.user.role !== 'Admin') {
            query.$or = [
                { createdBy: req.user.userId },
                { assignedTo: req.user.userId }
            ];
        }

        // Search in title and description (case-insensitive)
        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            });
        }

        // Apply filters
        if (priority) {
            query.priority = priority;
        }

        if (status) {
            query.status = status;
        }

        if (assignedTo) {
            query.assignedTo = assignedTo;
        }

        const tasks = await Task.find(query)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            data: {
                tasks
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching tasks',
            error: error.message
        });
    }
};

const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;

        const task = await Task.findById(taskId)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Access separation: Admins can see all tasks. Users can see tasks they created or are assigned to.
        const isCreator = task.createdBy._id.toString() === req.user.userId;
        const isAssignee = task.assignedTo && task.assignedTo._id.toString() === req.user.userId;

        if (req.user.role !== 'Admin' && !isCreator && !isAssignee) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to view this task.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task retrieved successfully',
            data: {
                task
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching task details',
            error: error.message
        });
    }
};

const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { title, description, priority, status, dueDate, assignedTo } = req.body;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Access separation: Admins can update any task. Users can update tasks they created or are assigned to.
        const isCreator = task.createdBy.toString() === req.user.userId;
        const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user.userId;

        if (req.user.role !== 'Admin' && !isCreator && !isAssignee) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to update this task.'
            });
        }

        const validation = validateTaskData({ title, description, priority, status, dueDate }, true);

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Update fields if provided
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (priority !== undefined) task.priority = priority;
        if (status !== undefined) task.status = status;
        
        if (dueDate !== undefined) {
            task.dueDate = dueDate || undefined;
        }

        if (assignedTo !== undefined) {
            task.assignedTo = assignedTo || undefined;
        }

        await task.save();

        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role');

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: {
                task: populatedTask
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during task update',
            error: error.message
        });
    }
};

const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;

        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Access separation: Admins can delete any task. Users can delete tasks they created only.
        const isCreator = task.createdBy.toString() === req.user.userId;

        if (req.user.role !== 'Admin' && !isCreator) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only the task creator or an administrator can delete this task.'
            });
        }

        await Task.findByIdAndDelete(taskId);

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during task deletion',
            error: error.message
        });
    }
};

const getTaskStats = async (req, res) => {
    try {
        const query = {};

        // Role-based scoping
        if (req.user.role !== 'Admin') {
            query.$or = [
                { createdBy: req.user.userId },
                { assignedTo: req.user.userId }
            ];
        }

        // Fetch all matching tasks for stats calculations
        const allTasks = await Task.find(query);

        const stats = {
            total: allTasks.length,
            open: allTasks.filter(t => t.status === 'Open').length,
            inProgress: allTasks.filter(t => t.status === 'In Progress').length,
            testing: allTasks.filter(t => t.status === 'Testing').length,
            active: allTasks.filter(t => t.status === 'In Progress' || t.status === 'Testing').length,
            done: allTasks.filter(t => t.status === 'Done').length,
            high: allTasks.filter(t => t.priority === 'High').length,
            medium: allTasks.filter(t => t.priority === 'Medium').length,
            low: allTasks.filter(t => t.priority === 'Low').length,
        };

        // Fetch top 5 recent tasks
        const recentTasks = await Task.find(query)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            message: 'Task statistics retrieved successfully',
            data: {
                stats,
                recentTasks
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching task statistics',
            error: error.message
        });
    }
};

const getTaskAnalytics = async (req, res) => {
    try {
        const query = {};
        if (req.user.role !== 'Admin') {
            query.$or = [
                { createdBy: req.user.userId },
                { assignedTo: req.user.userId }
            ];
        }

        const allTasks = await Task.find(query);
        const total = allTasks.length;
        const done = allTasks.filter(t => t.status === 'Done').length;
        const deliveryRate = total > 0 ? Math.round((done / total) * 100) : 0;

        // Calculate monthly velocity of completed tasks for the last 7 months
        const months = [];
        const monthlyCounts = {};

        // Generate last 7 months
        const date = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
            const monthName = d.toLocaleString('en-US', { month: 'short' });
            months.push(monthName);
            monthlyCounts[monthName] = 0;
        }

        // Populate counts
        allTasks.forEach(task => {
            if (task.status === 'Done' && task.updatedAt) {
                const taskMonth = new Date(task.updatedAt).toLocaleString('en-US', { month: 'short' });
                if (monthlyCounts[taskMonth] !== undefined) {
                    monthlyCounts[taskMonth]++;
                }
            }
        });

        const monthlyVelocity = months.map(m => ({
            month: m,
            count: monthlyCounts[m]
        }));

        res.status(200).json({
            success: true,
            message: 'Task analytics retrieved successfully',
            data: {
                deliveryRate,
                monthlyVelocity
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching task analytics',
            error: error.message
        });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats,
    getTaskAnalytics
};
