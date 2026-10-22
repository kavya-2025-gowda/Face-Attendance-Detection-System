const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ MongoDB connection (NO deprecated options)
mongoose.connect("mongodb://127.0.0.1:27017/face-attendance")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("MongoDB Error:", err));

// ✅ Models
const User = require("./models/User");
const Attendance = require("./models/Attendance");

// ✅ Health
app.get("/", (req, res) => res.send("Backend working 🚀"));
app.get("/test", (req, res) => res.json({ ok: true }));

// ✅ USERS
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    console.log("📦 Users:", users.length);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ REGISTER
app.post("/register", async (req, res) => {
  try {
    console.log("📥 Incoming:", req.body);

    const { name, descriptor } = req.body;

    if (!name || !descriptor) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const user = new User({ name, descriptor });
    await user.save();

    console.log("✅ User saved");

    res.json({ message: "User saved" });

  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ MARK ATTENDANCE
app.post("/attendance", async (req, res) => {
  try {
    const { user_id, name } = req.body;

    if (!user_id || !name) {
      return res.status(400).json({ error: "Missing data" });
    }

    const today = new Date().toISOString().split("T")[0];

    const existing = await Attendance.findOne({
      user_id,
      marked_date: today,
    });

    if (existing) {
      return res.json({ message: "Already marked today" });
    }

    const record = new Attendance({
      user_id,
      name,
      marked_date: today
    });

    await record.save();

    console.log("✅ Attendance marked:", name);

    res.json({ message: "Attendance marked" });

  } catch (err) {
    console.error("❌ Attendance error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ATTENDANCE LIST (THIS WAS MISSING)
app.get("/attendance", async (req, res) => {
  try {
    const records = await Attendance.find().sort({ created_at: -1 });

    console.log("📋 Attendance count:", records.length);

    res.json(records);
  } catch (err) {
    console.error("❌ Fetch attendance error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ START SERVER
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000 🚀");
});