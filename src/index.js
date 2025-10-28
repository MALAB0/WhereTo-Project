import express from "express";
import path from "path";
import bcrypt from "bcrypt";
import collection, { Rcollection, Route } from "./config.js";  // Import Route
import { name } from "ejs";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.static(path.join(process.cwd(), "src")));

// Routes
app.get("/signin", (req, res) => res.render("signin"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/otp", (req, res) => res.render("otp"));
app.get("/about", (req, res) => res.render("about"));
app.get("/homepage", (req, res) => res.render("homepage"));
app.get("/destination", (req, res) => res.render("destination"));
app.get("/livemap", (req, res) => res.render("LiveMap"));
app.get("/report", (req, res) => res.render("report"));
app.get("/notification", (req, res) => res.render("notification"));
app.get("/nav", (req, res) => res.render("navigation"));
app.get("/route", (req, res) => res.render("route"));
app.get("/profile", (req, res) => res.render("profile"));
app.get("/prof2", (req, res) => res.render("profile2"));
app.get("/admin", (req, res) => res.render("admin"));
app.get("/commuters", (req, res) => res.render("commuters"));
app.get("/aprof", (req, res) => res.render("aprofile"));
app.get("/reportadmin", (req, res) => res.render("reportadmin"));
app.get("/routem", (req, res) => res.render("routemanage"));
app.get("/userm", (req, res) => res.render("usermanage"));
app.get("/cpass", (req, res) => res.render("changepass"));
app.get("/changepassword", (req, res) => {
  if (!req.session.user) return res.redirect("/signin");
  res.render("changepassword");
});

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Rcollection.find({});
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.get('/api/location', async (req, res) => {
  try {
    res.json({ lat: 16.0346255, lng: 120.3355079, zoom: 13 });
  } catch (err) {
    console.error('Location API error', err);
    res.status(500).json({ error: 'Failed to get location' });
  }
});

// New API endpoints for routes
app.get('/api/routes', async (req, res) => {
  try {
    const routes = await Route.find({});
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
});

app.post('/api/routes', async (req, res) => {
  try {
    const newRoute = new Route(req.body);
    await newRoute.save();
    res.status(201).json(newRoute);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save route' });
  }
});

app.put('/api/routes/:id', async (req, res) => {
  try {
    const updatedRoute = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRoute) return res.status(404).json({ error: 'Route not found' });
    res.json(updatedRoute);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update route' });
  }
});

app.delete('/api/routes/:id', async (req, res) => {
  try {
    await Route.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Route deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete route' });
  }
});

app.post("/signup", async (req, res) => {
  console.log("POST /signup hit", req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    console.warn("Missing email or password");
    return res.status(400).send("Missing email or password");
  }
  try {
    const existing = await collection.findOne({ email });
    if (existing) return res.status(400).send("User already exists");
    const hash = await bcrypt.hash(password, 10);
    const created = await collection.create({ email, password: hash });
    console.log("Created user:", created.email);
    return res.status(201).redirect("/signin");
  } catch (err) {
    console.error("Error inserting user:", err);
    return res.status(500).send("Server error");
  }
});

app.post('/signin', async (req, res) => {
  console.log('POST /signin hit', req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).render('signin', { error: 'Missing email or password' });
  }
  try {
    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(401).render('signin', { error: 'Invalid email or password. Please try again or sign up.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).render('signin', { error: 'Invalid email or password. Please try again or sign up.' });
    }
    console.log('User signed in:', user.email);
    const username = email.toLowerCase().split('@')[0];
    if (username.includes('admin')) {
      return res.redirect('/admin');
    } else {
      return res.redirect('/destination');
    }
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).send('Server error');
  }
});

app.post("/change-password", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Not logged in" });
  }
  const { email, currentPassword, newPassword } = req.body;
  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }
  if (email !== req.session.user) {
    return res.status(403).json({ message: "Email does not match logged-in user" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters long" });
  }
  try {
    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await collection.updateOne({ email }, { $set: { password: hash } });
    console.log('Password changed for:', email);
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// Start server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on Port: ${PORT}`);
});