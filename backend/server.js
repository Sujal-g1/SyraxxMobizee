require("dotenv").config();
const express = require("express"); 
const cors = require("cors");
const { connectDB } = require("./database");
const userFeature = require("./routes/userFeature");
const routeSearch = require("./routes/routeSearch");
const routeBuses = require("./routes/routeBuses");

const app = express();

app.use((req, res, next) => {
  console.log(" INCOMING:", req.method, req.url);
  next();
});

// Middlewares
app.use(cors({
  origin: true,   // reflect the request origin automatically
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use((req, res, next) => {
  console.log("GLOBAL HIT:", req.method, req.url);
  next();
});


// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Database
connectDB();

// Routes
// const Bus = require("./database/models/bus");

// Mount ALL user routes
app.use("/api/users", userFeature);
app.use("/api/routes", routeSearch);
app.use("/api/routes", routeBuses);


app.get("/", (req, res) => res.send("🚍 Mobizee Backend Running"));


// Start Server
// const PORT = process.env.PORT || 5001;
const PORT = 5001;
app.listen(PORT, () => console.log(` Server: http://localhost:${PORT}`));