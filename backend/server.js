const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ CONNECT MONGODB
mongoose.connect("mongodb+srv://admin:8807696646@cluster0.regjvxo.mongodb.net/jobportal")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ✅ ROUTES
const jobRoutes = require("./jobRoutes");
app.use("/api/jobs", jobRoutes);

// ✅ LOGIN ROUTE
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "8807696646") {
    res.json({ success: true, token: "securetoken123" });
  } else {
    res.json({ success: false });
  }
});

// ✅ SERVE FRONTEND (VERY IMPORTANT)
app.use(express.static(path.join(__dirname, "/")));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


// ✅ PORT FIX FOR RENDER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});