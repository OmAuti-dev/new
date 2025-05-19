// routes/project.js
const express = require("express");
const Project = require("../models/Project");
const User = require("../models/User");
const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const authorizeRoles = require("../middlewares/role");

const router = express.Router();

// ✅ Create a project (Managers only)
router.post(
  "/projects",
  ClerkExpressRequireAuth(),
  authorizeRoles(["manager"]),
  async (req, res) => {
    try {
      const { title, description, userIds } = req.body;

      // Validate user existence
      const users = await User.find({ _id: { $in: userIds } });
      if (users.length !== userIds.length) {
        return res
          .status(400)
          .json({ success: false, error: "Some users not found" });
      }
      // Filter valid roles
      const invalidUsers = users.filter(
        (user) => !["teamleader", "employee", "client"].includes(user.role)
      );

      if (invalidUsers.length > 0) {
        return res.status(400).json({
          success: false,
          error:
            "Only teamleaders, employees, or clients can be assigned to a project",
        });
      }

      const clerkUserId = req.auth.userId;
      const manager = await User.findOne({ clerkId: clerkUserId });

      if (!manager) {
        return res
          .status(404)
          .json({ success: false, error: "Manager not found" });
      }

      // Create project
      const project = new Project({
        title,
        description,
        tasks: [],
        users: userIds,
        manager: manager._id,
        createdBy: clerkUserId, // Clerk user ID
      });
      if (!title || !userIds || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Title and at least one user are required",
        });
      }

      await project.save();

      res
        .status(201)
        .json({ success: true, message: "Project created", project });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

router.patch(
  "/projects/:id/add-users",
  ClerkExpressRequireAuth(),
  authorizeRoles(["manager"]),
  async (req, res) => {
    try {
      const { id: projectId } = req.params;
      const { userIds } = req.body;

      // Validate users' roles
      const validUsers = await User.find({
        _id: { $in: userIds },
        role: { $in: ["employee", "teamleader"] },
      });

      if (validUsers.length === 0) {
        return res.status(400).json({ success: false, error: "No valid users found with required roles" });
      }

      // Add users to project (no duplicates)
      const project = await Project.findByIdAndUpdate(
        projectId,
        { $addToSet: { users: { $each: validUsers.map((u) => u._id) } } },
        { new: true }
      ).populate("users", "name email role");

      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found" });
      }

      res.status(200).json({ success: true, message: "Users added to project", project });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

router.get(
  "/projects/:projectId/users",
  ClerkExpressRequireAuth(),
  async (req, res) => {
    try {
      const { projectId } = req.params;

      const project = await Project.findById(projectId).populate("users", "name email role");

      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }

      res.status(200).json({ success: true, users: project.users });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

module.exports = router;
