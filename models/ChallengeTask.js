const mongoose = require('mongoose');

const challeneTaskSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    priority: { type: String, enum: ['red', 'orange', 'yellow'], default: 'yellow' },
    completed: { type: Boolean, default: false },
    status: {
        enum: ["start", "expire"]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    expiresAt: {
        type: Date,
    }
});

// Create a TTL index on the expiresAt field
challeneTaskSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

const ChallengeTask = mongoose.model('ChallengeTask', challeneTaskSchema);

module.exports = ChallengeTask;
