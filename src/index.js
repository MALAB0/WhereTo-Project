import express from "express";
import session from "express-session";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';  // Add this
import path from "path";
import bcrypt from "bcryptjs";
import { promisify } from 'util';
import collection, { Rcollection, Route } from "./config.js";
dotenv.config();

// Promisify bcryptjs callback-style functions so existing `await bcrypt.hash/compare` works
bcrypt.hash = promisify(bcrypt.hash);
bcrypt.compare = promisify(bcrypt.compare);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.static(path.join(process.cwd(), "src")));

// Session middleware (added for OTP)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key', // Use SESSION_SECRET from .env in production
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 10 * 60 * 1000 }  // 10 minutes
}));

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to generate 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
app.get('/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'your-test-email@gmail.com',  // Replace with your email
      subject: 'Test OTP',
      text: 'Test OTP: 1234'
    });
    res.send('Email sent successfully!');
  } catch (err) {
    console.error('Test email error:', err);
    res.send('Email failed: ' + err.message);
  }
});
// Routes (unchanged except where noted)
app.get("/signin", (req, res) => res.render("signin"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/otp", (req, res) => {
  console.log("GET /otp route hit");  // Add this line
  res.render("otp");
});  // Now used for both signup and signin
app.get("/about", (req, res) => res.render("about"));
app.get("/homepage", (req, res) => res.render("homepage"));
app.get("/destination", (req, res) => res.render("destination"));
app.get("/livemap", (req, res) => res.render("LiveMap"));
app.get("/report", (req, res) => res.render("report"));
app.get("/notification", (req, res) => res.render("notification"));
app.get("/nav", (req, res) => res.render("navigation"));
app.get("/profile", (req, res) => res.render("profile"));
app.get("/prof2", (req, res) => res.render("profile2"));
app.get("/admin", (req, res) => res.render("admin"));
app.get("/commuters", (req, res) => res.render("commuters"));
app.get("/aprof", (req, res) => res.render("aprofile"));
app.get("/reportadmin", (req, res) => res.render("reportadmin"));
app.get("/routem", (req, res) => res.render("routemanage"));
app.get("/userm", (req, res) => res.render("usermanage"));
app.get("/cpass", (req, res) => res.render("changepass"));

app.get("/route", async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      // If no params, render with no data (fallback)
      return res.render("route", { routes: [], from: null, to: null, error: "Please provide a starting point and destination." });
    }
    
    // Query MongoDB for routes matching start and end
    const routes = await Route.find({ start: from, end: to });
    
    // Render the route.ejs template with fetched data
    res.render("route", { routes, from, to, error: null });
  } catch (err) {
    console.error("Error fetching routes:", err);
    res.status(500).render("route", { routes: [], from: null, to: null, error: "Failed to load routes. Please try again." });
  }
});
app.get("/changepassword", (req, res) => {
  if (!req.session.user) return res.redirect("/signin");
  res.render("changepassword");
});

app.post('/api/reports', async (req, res) => {
  try {
    const newReport = new Rcollection(req.body);
    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save report' });
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

app.get('/api/user', async (req, res) => {
  try {
    // Check if user is authenticated via session
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    // Fetch user from database using the email stored in session
    const user = await collection.findOne({ email: req.session.user });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Return user data (username as name, email)
    res.json({
      name: user.username || 'User',  // Fallback if username is missing
      email: user.email
    });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
   
// ========== ADMIN REPORT MANAGEMENT ==========
app.get("/api/admin/reports", async (req, res) => {
  try {
    const reports = await Rcollection.find({});
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// New: API for admin to update report status
app.put('/api/admin/reports/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updatedReport = await Rcollection.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updatedReport) return res.status(404).json({ error: 'Report not found' });
    res.json(updatedReport);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report' });
  }
});

app.get('/api/admin/reports/pending-count', async (req, res) => {
  try {
    const count = await Rcollection.countDocuments({ status: 'pending' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending count' });
  }
});
// Modified POST /signup: Generate OTP, send email, store in session, redirect to /otp
app.post("/signup", async (req, res) => {
  console.log("POST /signup hit", req.body);
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send("Missing username, email, or password");
  }
});

// ========== 🔹 SEARCH TRACKING (For Admin Analytics) ==========
app.post("/api/search", async (req, res) => {

  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: "Missing 'from' or 'to'" });
    }

    await Search.create({ from, to });
    console.log(`📍 New route searched: ${from} → ${to}`);
    res.status(201).json({ message: "Search recorded" });
  } catch (err) {
    console.error("Search save error:", err);
    res.status(500).json({ error: "Failed to save search" });
  }
});

app.get("/api/search/stats", async (req, res) => {
  try {
    const stats = await Search.aggregate([
      { $group: { _id: { from: "$from", to: "$to" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(stats);
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ========== USER AUTH WITH OTP ==========

// Signup
app.post("/signup", async (req, res) => {
  console.log("POST /signup hit", req.body);
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send("Missing username, email, or password");
  }
  try {
    const existing = await collection.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).send("User with this email or username already exists");
    }

    console.log("Generating OTP and sending email...");
    const otp = generateOTP();
    req.session.otp = { code: otp, email, username, password, action: 'signup', timestamp: Date.now() };
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your OTP for WhereTo Signup',
      text: `Your 4-digit OTP is: ${otp}. It expires in 10 minutes.`
    });
    console.log("Email sent, redirecting to /otp");
    res.redirect('/otp');
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Server error");
  }
});
// Modified POST /signin: Directly authenticate and log in without OTP
app.post('/signin', async (req, res) => {
  console.log('POST /signin hit', req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).render('signin', { error: 'Missing email or password' });
  }
  try {
    const user = await collection.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).render('signin', { error: 'Invalid email or password. Please try again or sign up.' });
    }

    // Directly log in the user
    req.session.user = user.email;
    const username = user.email.toLowerCase().split('@')[0];
    const redirect = username.includes('admin') ? '/admin' : '/destination';
    res.redirect(redirect);
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).send('Server error');
  }
});

// New POST /verify-otp: Verify OTP and complete signup/signin
app.post('/verify-otp', async (req, res) => {
  console.log("POST /verify-otp hit", req.body); 
  const { code } = req.body;
  const sessionOtp = req.session.otp;

  if (!sessionOtp || !code) {
    return res.status(400).send('Invalid request');
  }

  // Check expiration (10 minutes)
  if (Date.now() - sessionOtp.timestamp > 10 * 60 * 1000) {
    delete req.session.otp;
    return res.status(400).send('OTP expired');
  }

  if (code !== sessionOtp.code) {
    return res.status(400).send('Invalid OTP');
  }

  try {
    if (sessionOtp.action === 'signup') {
      // Create and save user to MongoDB
      const hash = await bcrypt.hash(sessionOtp.password, 10);
      await collection.create({ username: sessionOtp.username, email: sessionOtp.email, password: hash });
      delete req.session.otp;
      return res.json({ redirect: '/signin' });  // Redirect to signin after successful signup
    } else if (sessionOtp.action === 'signin') {
      // Proceed with login
      const user = await collection.findById(sessionOtp.userId);
      req.session.user = user.email;  // Store user in session for future requests
      delete req.session.otp;
      const username = user.email.toLowerCase().split('@')[0];
      const redirect = username.includes('admin') ? '/admin' : '/destination';
      return res.json({ redirect });
    }
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).send('Server error');
  }
});

// New POST /resend-otp: Resend OTP if session exists
app.post('/resend-otp', async (req, res) => {
  const sessionOtp = req.session.otp;
  if (!sessionOtp) {
    return res.status(400).send('No active OTP session');
  }

  // Check expiration
  if (Date.now() - sessionOtp.timestamp > 10 * 60 * 1000) {
    delete req.session.otp;
    return res.status(400).send('OTP session expired');
  }

  try {
    const otp = generateOTP();
    req.session.otp.code = otp;  // Update code in session
    req.session.otp.timestamp = Date.now();  // Reset timestamp
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: sessionOtp.email,
      subject: `Your OTP for WhereTo ${sessionOtp.action === 'signup' ? 'Signup' : 'Signin'}`,
      text: `Your new 4-digit OTP is: ${otp}. It expires in 10 minutes.`
    });
    res.send('OTP resent');
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).send('Failed to resend OTP');
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
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on Port: ${PORT}`);
});