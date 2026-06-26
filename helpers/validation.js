const validator = require('validator');

const validateEmail = (email) => {
    if (!email) {
        return { isValid: false, message: 'Email is required' };
    }
    if (!validator.isEmail(email)) {
        return { isValid: false, message: 'Invalid email format' };
    }
    return { isValid: true };
};

const validateName = (name) => {
    if (!name || validator.isEmpty(name.trim())) {
        return { isValid: false, message: 'Name is required' };
    }
    return { isValid: true };
};

const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    return { isValid: true };
};

const validateSignupData = (data) => {
    const errors = [];

    const nameCheck = validateName(data.name);
    if (!nameCheck.isValid) errors.push(nameCheck.message);

    const emailCheck = validateEmail(data.email);
    if (!emailCheck.isValid) errors.push(emailCheck.message);

    const passwordCheck = validatePassword(data.password);
    if (!passwordCheck.isValid) errors.push(passwordCheck.message);

    if (data.role && !['User', 'Admin'].includes(data.role)) {
        errors.push('Role must be either "User" or "Admin"');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateSigninData = (data) => {
    const errors = [];

    const emailCheck = validateEmail(data.email);
    if (!emailCheck.isValid) errors.push(emailCheck.message);

    if (!data.password) {
        errors.push('Password is required');
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

const validateTaskData = (data, isUpdate = false) => {
    const errors = [];

    if (!isUpdate || data.title !== undefined) {
        if (!data.title || validator.isEmpty(data.title.trim())) {
            errors.push('Task title is required');
        }
    }

    if (data.priority !== undefined) {
        if (!['Low', 'Medium', 'High'].includes(data.priority)) {
            errors.push('Priority must be "Low", "Medium", or "High"');
        }
    }

    if (data.status !== undefined) {
        if (!['Open', 'In Progress', 'Testing', 'Done'].includes(data.status)) {
            errors.push('Status must be "Open", "In Progress", "Testing", or "Done"');
        }
    }

    if (data.dueDate !== undefined && data.dueDate !== null && data.dueDate !== '') {
        const timestamp = Date.parse(data.dueDate);
        if (isNaN(timestamp)) {
            errors.push('Due date must be a valid date');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

module.exports = {
    validateEmail,
    validateName,
    validatePassword,
    validateSignupData,
    validateSigninData,
    validateTaskData
};
