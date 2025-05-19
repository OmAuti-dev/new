const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  
  role: {
    type: String,
    enum: ["manager", "teamleader", "employee"],
    required: true,
    default: "employee",
  },

  skills: { 
    type: [String], 
    default: [] 
  }, // Skills for task assignment

  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],

  teams: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Team" 
  }], // Teams the user is part of
  

  currentTask: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Task", 
    default: null 
  }, // Currently assigned task

  isAvailable: { 
    type: String, 
    default: true 
  }, // Determines if an employee can take new tasks

  workload: { 
    type: Number, 
    default: 0 
  }, // Tracks the number of active tasks for fair assignment

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("User", UserSchema);



// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//   clerkId: { type: String, required: true, unique: true }, // Clerk's Unique User ID
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   role: {
//     type: String,
//     enum: ["client", "employee", "manager", "teamleader"],
//     required: true,
//     default: "client",
//   },
//   tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }], // List of assigned task IDs
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("User", UserSchema);
