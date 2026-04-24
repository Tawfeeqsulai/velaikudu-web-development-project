const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://admin:8807696646@cluster0.regjvxo.mongodb.net/jobportal")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const jobRoutes = require("./routes/jobRoutes");
app.use("/api/jobs", jobRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));

// SIMPLE LOGIN (HARDCODED)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "8807696646") {
    res.json({ success: true, token: "securetoken123" });
  } else {
    res.json({ success: false });
  }
});