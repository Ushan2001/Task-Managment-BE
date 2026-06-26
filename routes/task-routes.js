const express = require('express');
const router = express.Router();
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTaskStats,
    getTaskAnalytics
} = require('../controllers/task-controller');
const { verifyToken } = require('../helpers/auth-middleware');

router.post('/', verifyToken, createTask);
router.get('/', verifyToken, getTasks);
router.get('/stats', verifyToken, getTaskStats);
router.get('/analytics', verifyToken, getTaskAnalytics);
router.get('/:id', verifyToken, getTaskById);
router.put('/:id', verifyToken, updateTask);
router.delete('/:id', verifyToken, deleteTask);

module.exports = router;
