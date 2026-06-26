const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        status: {
            type: String,
            enum: ['Open', 'In Progress', 'Testing', 'Done'],
            default: 'Open'
        },
        dueDate: {
            type: Date
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);
