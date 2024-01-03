const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['red', 'orange', 'yellow'], default: 'yellow' },
  alertMode: { type: Boolean, default: false },
  completed: { type: Boolean, default: false },
  dueHours: { type: Number },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
