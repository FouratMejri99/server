const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5001",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API is working on Vercel!" });
});

// Export API handler for Vercel
module.exports = app;
