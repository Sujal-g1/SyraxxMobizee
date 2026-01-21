require("dotenv").config();
const express = require("express"); 
const cors = require("cors");
const { connectDB } = require("./database");
const userFeature = require("./routes/userFeature");

const app = express();

// Middlewares
app.use(cors({
  // origin: true, 
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Database
connectDB();

// Routes
const Bus = require("./database/models/bus");

// Mount ALL user routes to userFeature.js
app.use("/api/users", userFeature);

app.get("/", (req, res) => res.send("🚍 Mobizee Backend Running"));

app.post("/api/bus", async (req, res) => {
  try {
    const bus = new Bus(req.body);
    await bus.save();
    res.json(bus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server: http://localhost:${PORT}`));