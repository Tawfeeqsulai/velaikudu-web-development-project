const express = require("express");
const router = express.Router();
const Job = require("./Job");

// 🔐 AUTH MIDDLEWARE
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (token !== "securetoken123") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
}

// ✅ CREATE (PROTECTED)
router.post("/", auth, async (req, res) => {
  const job = new Job(req.body);
  await job.save();
  res.json(job);
});

// ✅ GET ALL (PUBLIC - USERS CAN VIEW)
router.get("/", async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
});

// ✅ DELETE (PROTECTED)
router.delete("/:id", auth, async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

// ✅ UPDATE (PROTECTED)
router.put("/:id", auth, async (req, res) => {
  const updated = await Job.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

module.exports = router;