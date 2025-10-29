// server.js
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js"; // Import your MongoDB connection
import authRoutes from "./routes/authRoutes.js"; // Import your auth routes
import exportRouteReport from "./routes/exportRouteReport.js"; // ✅ correct import for exportReportRoute
const app = express();

//Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // allows your frontend to connect
app.use(express.json()); // parse JSON request bodies

//  Example route
app.use("/api/auth", authRoutes); // ✅ This line actually uses authRoutes

//Example POST route for users (temporary test)
app.post("/api/users", (req, res) => {
  const { name, email, password } = req.body;
  res.send(`Received new user: ${name}, ${email}`);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.use('/api/export', exportRouteReport); // ito tsaka ung nasa baba dinagdagdag ko for exporting excel


