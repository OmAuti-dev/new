const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/clerk-webhook", async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === "user.created") {
      const { id, email_addresses, first_name, last_name } = data;
      const existingUser = await User.findOne({ clerkId: id });

      if (!existingUser) {
        const newUser = new User({
          clerkId: id,
          email: email_addresses[0]?.email_address || "",
          name: `${first_name} ${last_name}`.trim(),
        });
        await newUser.save();
        console.log("✅ User synced:", newUser);
      }
    }

    if (type === "user.updated") {
      const { id, first_name, last_name } = data;
      await User.findOneAndUpdate(
        { clerkId: id },
        { name: `${first_name} ${last_name}`.trim() }
      );
      console.log("✅ User updated:", id);
    }

    if (type === "user.deleted") {
      const { id } = data;
      await User.findOneAndDelete({ clerkId: id });
      console.log("✅ User deleted:", id);
    }

    res.status(200).send({ message: "Webhook received" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
