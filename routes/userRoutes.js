const express = require("express");
const User = require("../models/User");
const Task = require("../models/Task")
const Project = require("../models/Project")
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const router = express.Router();

// 5️⃣ Get a user with assigned tasks
// router.get("/users/:userId", ClerkExpressRequireAuth(), async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ success: true, message: "User not found" });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Get all users
// router.get("/users", ClerkExpressRequireAuth(), async (req, res) => {
//   try {
//     const users = await User.find().populate(
//       "tasks",
//       "title description status"
//     );

//     if (!users || users.length === 0) {
//       return res.status(404).json({ message: "No users found" });
//     }

//     res.status(200).json({ success: true, users });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });
  

// tested
router.get(
  "/projects/:projectId/tasks/:taskId/users",
  ClerkExpressRequireAuth(),
  async (req, res) => {
    try {
      const { projectId, taskId } = req.params;

      // 1. Verify project exists
      const project = await Project.findById(projectId).populate("users","name");
      if (!project) return res.status(404).json({ error: "Project not found" });

      // 2. Verify task exists and belongs to project
      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ error: "Task not found" });

      // Check if task is part of project.tasks
      if (!project.tasks.includes(task._id)) {
        return res
          .status(400)
          .json({ error: "Task does not belong to the project" });
      }

      // 3. Separate assigned and unassigned users within project users
      const assignedUserIds = task.assignedUsers.map((id) => id.toString());

      const assignedUsers = project.users.filter((user) =>
        assignedUserIds.includes(user._id.toString())
      );

      const unassignedUsers = project.users.filter(
        (user) => !assignedUserIds.includes(user._id.toString())
      );

      res.status(200).json({
        success: true,
        assignedUsers,
        unassignedUsers,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);



// **
//  * ✅ 6. Get the current authenticated user
//  */
router.get("/user/me", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const userId = req.auth?.userId;
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Send the user details in the response
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
