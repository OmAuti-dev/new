const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, unique:true },
  description: { type: String },
  manager: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], // Associated tasks
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }], // Assigned teams
  deadline: { type: Date },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

// Auto-assign priority based on deadline
projectSchema.pre("save", function (next) {
  if (this.deadline) {
    const timeLeft = new Date(this.deadline) - new Date();
    if (timeLeft < 48 * 60 * 60 * 1000)
      this.priority = "high"; // Less than 2 days
    else if (timeLeft < 7 * 24 * 60 * 60 * 1000) this.priority = "medium"; // Less than a week
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
