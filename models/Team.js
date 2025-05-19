const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Team members
  teamLead: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Assigned Leader
  skillset: [{ type: String, required: true }], // Required skills for the team
  createdAt: { type: Date, default: Date.now },
});

// Auto-assign team lead based on experience
teamSchema.pre("save", async function (next) {
  if (!this.teamLead && this.members.length > 0) {
    const users = await mongoose.model("User").find({ _id: { $in: this.members } }).sort({ experience: -1 });
    if (users.length) this.teamLead = users[0]._id;
  }
  next();
});

module.exports = mongoose.model("Team", teamSchema);
