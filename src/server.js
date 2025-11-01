const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Temporary in-memory data
let users = [];
let searches = [];

// ===== Middleware =====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ===== Routes =====

// Home Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Sign Up
app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  const userExists = users.find((u) => u.email === email);
  if (userExists) return res.status(400).send("User already exists");

  users.push({ email, password });
  console.log("🟢 New user registered:", email);
  res.redirect("/signin.html");
});

// Sign In
app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) return res.status(401).send("Invalid credentials");

  console.log("🟢 User logged in:", email);
  res.redirect("/destination");
});

// ===== Search Logging (for admin analytics) =====
app.post("/api/search", (req, res) => {
  const { from, to } = req.body;

  if (!from || !to)
    return res.status(400).json({ error: "Missing 'from' or 'to'" });

  const record = { from, to, date: new Date() };
  searches.push(record);

  console.log("📍 New route searched:", from, "→", to);
  res.status(201).json({ message: "Search recorded" });
});

// Fetch route statistics
app.get("/api/search/stats", (req, res) => {
  const statsMap = {};

  for (const s of searches) {
    const key = `${s.from}→${s.to}`;
    statsMap[key] = (statsMap[key] || 0) + 1;
  }

  const statsArray = Object.entries(statsMap).map(([route, count]) => {
    const [from, to] = route.split("→");
    return { _id: { from, to }, count };
  });

  statsArray.sort((a, b) => b.count - a.count);
  res.json(statsArray);
});

// ===== EJS Page Routes =====

// Destination Page (User Side)
app.get("/destination", (req, res) => {
  res.render("destination");
});

// Admin Dashboard (Admin Side)
app.get("/admin", (req, res) => {
  res.render("admin");
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
