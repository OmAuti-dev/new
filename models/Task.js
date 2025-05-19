const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },

  requiredSkills: {
    type: [String],
    default: ["nodejs"],
  }, // Skills needed for this task

  deadline: { type: Date },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },

  status: {
    type: String,
    enum: ["todo", "in-progress", "completed", "blocked"],
    default: "todo",
  },

  category: { type: String, default: "general" },

  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }, // Manager who assigned the task

  assignedUsers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  ],

  assignedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    default: null,
  }, // The team assigned to this task

  dependencies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ], // Tasks that must be completed first

  createdAt: {
    type: Date,
    default: () => {
      const now = new Date();
      const offset = 5.5 * 60 * 60 * 1000; // IST (UTC+5:30)
      return new Date(now.getTime() + offset);
    },
  },
});

module.exports = mongoose.model("Task", TaskSchema);

// const mongoose = require("mongoose");

// const TaskSchema = new mongoose.Schema({
//   title: { type: String, required: true, unique: true },
//   description: { type: String, required: true },
//   skillset: {
//     type: [String],
//     default: ["nodejs"],
//   },
//   deadline: { type: Date },
//   priority: {
//     type: String,
//     enum: ["low", "medium", "high"],
//     default: "medium",
//   },
//   status: {
//     type: String,
//     enum: ["todo", "in-progress", "completed"],
//     default: "todo",
//   },
//   category: { type: String, default: "general" },
//   assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   date: {
//     type: Date,
//     default: () => {
//       const now = new Date();
//       const offset = 5.5 * 60 * 60 * 1000; // IST (UTC+5:30)
//       return new Date(now.getTime() + offset);
//     },
//   },
// });

// module.exports = mongoose.model("Task", TaskSchema);
