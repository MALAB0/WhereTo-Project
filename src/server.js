const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const PORT = 3000;

// Fake in-memory users (replace with DB later)
let users = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.js"));
});

// Sign up
app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  const userExists = users.find((u) => u.email === email);
  if (userExists) return res.status(400).send("User already exists");
  users.push({ email, password });
  console.log("User registered:", email);
  res.redirect("/signin.html");
});

// Sign in
app.post("/signin", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) return res.status(401).send("Invalid credentials");
  console.log("User logged in:", email);
  res.redirect("/destination.html");
});

app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);