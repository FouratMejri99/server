const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();

const User = require("./models/user.models");

// Middleware

const corsOptions = {
  origin: [
    "https://stockio-topaz.vercel.app",
    "http://localhost:5000",
    "https://server-pbhy.vercel.app",
  ], // Allow frontend & local testing
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Allow cookies & authentication
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Authentication Middleware
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Delete User Stock Route
app.delete("/delete-user-stock/:symbol", authenticateUser, async (req, res) => {
  try {
    const { symbol } = req.params;

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the stock symbol from user's stocks list
    user.stocks = user.stocks.filter((stock) => stock !== symbol);
    await user.save();

    res.json({ message: "Stock removed successfully", stocks: user.stocks });
  } catch (error) {
    console.error("Error deleting user stock:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get Real-time Data for a Stock
app.get("/get-stock-data", (req, res) => {
  exec(`python fetch_data.py`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error.message}`);
      return res.status(500).send(`Error executing script: ${error.message}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).send(`Script error: ${stderr}`);
    }

    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (parseError) {
      console.error(`JSON parse error: ${parseError}`);
      res.status(500).send("Invalid JSON output from script.");
    }
  });
});

// Get Sector Allocation for a Stock
app.get("/get-sector-allocation/:symbol", (req, res) => {
  const symbol = req.params.symbol;

  exec(`python sector-allocation.py ${symbol}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send("Error fetching sector allocation data.");
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).send("Error fetching sector allocation data.");
    }

    try {
      // Parse the output as JSON and send it as a response
      const sectorAllocation = JSON.parse(stdout);
      res.json(sectorAllocation);
    } catch (e) {
      console.error("Error parsing JSON:", e);
      return res.status(500).send("Error parsing sector allocation data.");
    }
  });
});

// Add Stock Route
app.post("/add-stock", authenticateUser, async (req, res) => {
  const { stockData } = req.body;

  if (!stockData) {
    return res.status(400).json({ message: "Stock data is required" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.stocks.push(stockData);
    await user.save();

    res.json({ message: "Stock added successfully!", stocks: user.stocks });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Register Route
app.post("/register", async (req, res) => {
  const { email, username, password, confirmPassword } = req.body;

  if (!email || !username || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, username, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: { email: newUser.email, username: newUser.username },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during registration" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: { email: user.email, username: user.username, stocks: user.stocks },
    });
  } catch (error) {
    console.error("🔥 LOGIN ERROR:", error); // 🔴 This will log the exact issue!
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
});

// Get User Stocks Route
app.get("/get-user-stocks", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ stocks: user.stocks });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API is working on Vercel!" });
});

// Export API handler for Vercel
module.exports = app;
