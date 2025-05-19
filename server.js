const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const clerkWebhook = require("./routes/clerkWebhook");
const projectRoutes = require("./routes/projectRoutes")

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api", taskRoutes);
app.use("/api", userRoutes);
app.use("/api", clerkWebhook);
app.use("/api", projectRoutes)

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API!" });
});
