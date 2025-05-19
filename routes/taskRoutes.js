const express = require("express");
const Task = require("../models/Task");
const User = require("../models/User");
const Project = require("../models/Project");
const authorizeRoles = require("../middlewares/role"); // Role Middleware
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");

const router = express.Router();

/**
 * ✅ 1. Create a Task ||| TEsted
 */

router.post(
  "/projects/:projectId/tasks",
  ClerkExpressRequireAuth(),
  authorizeRoles(["manager", "teamleader"]),
  async (req, res) => {
    try {
      const { projectId } = req.params;

      // Check if project exists
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // ✅ Create task and link to project
      const task = new Task({
        ...req.body,
        project: projectId,
      });

      await task.save();

      // ✅ Add task to project
      project.tasks.push(task._id);
      await project.save();

      res.status(201).json({
        success: true,
        message: "Task created and linked to project successfully",
        task,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

/**
 * ✅ 2. Assign Users to a Task |||  tested
 */
router.post(
  "/projects/:projectId/tasks/:taskId/assign",
  ClerkExpressRequireAuth(),
  authorizeRoles(["manager", "teamleader"]),
  async (req, res) => {
    try {
      const { projectId, taskId } = req.params;
      const { userIds } = req.body;

      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ error: "Task not found" });

      if (task.project.toString() !== projectId) {
        return res.status(400).json({ error: "Task does not belong to this project" });
      }

      const project = await Project.findById(projectId);
      if (!project) return res.status(404).json({ error: "Project not found" });

      // Filter users that belong to the project
      const validUserIds = userIds.filter((id) =>
        project.users.map((u) => u.toString()).includes(id)
      );

      if (validUserIds.length === 0) {
        return res.status(400).json({ error: "No valid users found in this project" });
      }

      // Assign users to task
      task.assignedTeam.push(...validUserIds);
      await task.save();

      await User.updateMany(
        { _id: { $in: validUserIds } },
        {
          $push: { tasks: task._id },
          $set: { isAvailable: "false" } // mark users as unavailable
        }
      );

      res.status(200).json({
        success: true,
        message: "Users assigned to task and marked unavailable",
        task,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);


/**
 * ✅ 3. Get Tasks with Assigned Users ||| sure nahi ahe ha api thevaycha ki nahi **************
 */
//need change
router.get("/tasks/:taskId", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedUsers", "name email");
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ 4. Get Users with Assigned Tasks |||  sure nahi ahe ha api thevaycha ki nahi **************
 */
router.get("/users", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const users = await User.find().populate("tasks", "title description");
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * ✅ 5. Remove a User from a Task need change note on 15 may ****************
 */
router.delete(
  "/tasks/:taskId/remove/:userId",
  ClerkExpressRequireAuth(),
  async (req, res) => {
    try {
      const { taskId, userId } = req.params;

      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ error: "Task not found" });

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Remove user from task's assignedUsers list
      task.assignedUsers = task.assignedUsers.filter(
        (id) => id.toString() !== userId
      );
      await task.save();

      // Remove task from user's tasks list
      user.tasks = user.tasks.filter((id) => id.toString() !== taskId);
      await user.save();

      res.status(200).json({
        success: true,
        message: "User removed from task successfully",
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

// 6 GET ALL TASKS need change *********************
router.get("/tasks", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedUsers", "name email");
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//fetch tasks by project
router.get(
  "/projects/:projectId/tasks",
  ClerkExpressRequireAuth(),
  async (req, res) => {
    try {
      const { projectId } = req.params;

      const tasks = await Task.find({ project: projectId })
        .populate("assignedUsers", "name email")
        .populate("project", "title");

      res.status(200).json({ success: true, tasks });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

//assigned and unassigned users list


// router.get("/tasks", async (req, res) => {
//   console.log("🔹 Route is running!"); // If this works, Clerk may be blocking logs
//   res.send("Check console");
// });

module.exports = router;
