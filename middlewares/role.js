const User = require("../models/User");
const Team = require("../models/Team");

/**
 * ✅ Role-Based & Team-Based Access Control Middleware
 * @param {Array} allowedRoles - Array of roles that can access the route
 * @param {Boolean} checkTeam - If true, verifies if the user belongs to a relevant team
 */
const authorizeRoles = (allowedRoles, checkTeam = false) => {
  return async (req, res, next) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      // Fetch user with role and team data
      const user = await User.findOne({ clerkId: userId }).select("role teams");
      if (!user) return res.status(404).json({ error: "User not found" });

      // Role-based authorization
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Team-based authorization (if required)
      if (checkTeam) {
        const teamExists = await Team.findOne({ members: user._id });
        if (!teamExists) {
          return res.status(403).json({ error: "Access denied: No team assigned" });
        }
      }

      next();
    } catch (err) {
      console.error("Authorization Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

module.exports = authorizeRoles;
