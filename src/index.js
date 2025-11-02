import express from "express";
import session from "express-session";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';  // Add this
import path from "path";
import bcrypt from "bcryptjs";
import { promisify } from 'util';
import mongoose from "mongoose";
import collection, { Rcollection, Route } from "./config.js";

dotenv.config();

// Promisify bcryptjs callback-style functions so existing `await bcrypt.hash/compare` works
bcrypt.hash = promisify(bcrypt.hash);
bcrypt.compare = promisify(bcrypt.compare);

const app = express();

const searchSchema = new mongoose.Schema({
  from: String,
  to: String,
  date: { type: Date, default: Date.now },
});

const Search = mongoose.model("Search", searchSchema);

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
app.get("/admin", async (req, res) => {
  try {
    // Get all stats in parallel for better performance
    const [totalUsers, activeRoutes, pendingReports, dailySearches] = await Promise.all([
      // Count total users
      collection.countDocuments(),
      // Count active routes (routes with valid start and end points)
      Route.countDocuments({ 
        status: { $ne: 'deleted' },  // Exclude deleted routes
        start: { $exists: true, $ne: '' }, // Has valid start point
        end: { $exists: true, $ne: '' }    // Has valid end point
      }),
      // Count pending reports
      Rcollection.countDocuments({ status: 'pending' }),
      // Count today's searches
      Search.countDocuments({
        date: { $gte: new Date(new Date().setHours(0,0,0,0)) }
      })
    ]);

    res.render("admin", {
      stats: {
        totalUsers,
        activeRoutes,
        pendingReports,
        dailySearches
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.render("admin", {
      stats: {
        totalUsers: 0,
        activeRoutes: 0,
        pendingReports: 0,
        dailySearches: 0
      }
    });
  }
});
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
    console.log('Creating new route:', req.body);
    const { name, status, start, end, fare, steps } = req.body;
    
    // Validate required fields
    if (!name || !status || !start || !end || !fare) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newRoute = new Route({
      name,
      status,
      start,
      end,
      fare: parseFloat(fare),
      steps: Array.isArray(steps) ? steps : []
    });

    await newRoute.save();
    console.log('Route created:', newRoute);
    res.status(201).json(newRoute);
  } catch (err) {
    console.error('Failed to save route:', err);
    res.status(500).json({ error: 'Failed to save route: ' + err.message });
  }
});

app.put('/api/routes/:id', async (req, res) => {
  try {
    console.log('Updating route:', req.params.id, req.body);
    const { name, status, start, end, fare, steps } = req.body;
    
    // Validate required fields
    if (!name || !status || !start || !end || !fare) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id, 
      {
        name,
        status,
        start,
        end,
        fare: parseFloat(fare),
        steps: Array.isArray(steps) ? steps : []
      },
      { new: true, runValidators: true }
    );

    if (!updatedRoute) {
      return res.status(404).json({ error: 'Route not found' });
    }

    console.log('Route updated:', updatedRoute);
    res.json(updatedRoute);
  } catch (err) {
    console.error('Failed to update route:', err);
    res.status(500).json({ error: 'Failed to update route: ' + err.message });
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

    // Get saved routes count
    const savedRoutes = await Route.countDocuments({ 'createdBy': user._id });
    
    // Get reports count
    const reports = await Rcollection.countDocuments({ 'submittedBy': user._id });

    // Return complete profile data
    res.json({
      name: user.username || 'User',
      email: user.email,
      stats: {
        tripsTaken: user.tripsTaken || 0,
        savedRoutes: savedRoutes || 0,
        reportsMade: reports || 0,
        rating: user.rating || 4.5
      },
      preferences: {
        notifications: user.preferences?.notifications ?? true,
        location: user.preferences?.location ?? true,
        autoSave: user.preferences?.autoSave ?? false
      }
    });
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user preferences
app.post('/api/user/preferences', async (req, res) => {
  try {
    // Check authentication
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Validate preferences object
    const preferences = req.body;
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: 'Invalid preferences data' });
    }

    // Only allow valid preference keys
    const allowedPreferences = ['notifications', 'location', 'autoSave'];
    const invalidKeys = Object.keys(preferences).filter(key => !allowedPreferences.includes(key));
    if (invalidKeys.length > 0) {
      return res.status(400).json({ error: 'Invalid preference keys: ' + invalidKeys.join(', ') });
    }

    // Update user preferences
    const user = await collection.findOne({ email: req.session.user });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Merge existing preferences with updates
    const updatedPreferences = {
      ...user.preferences || {},
      ...preferences
    };

    await collection.updateOne(
      { email: req.session.user },
      { $set: { preferences: updatedPreferences } }
    );

    res.json({ message: 'Preferences updated successfully' });
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
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
// (removed duplicate incomplete /signup handler) 

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
  try {
    console.log("=== OTP Verification Start ===");
    console.log("Request body:", req.body); 
    console.log("Session state:", {
      hasSession: !!req.session,
      hasOtp: !!req.session?.otp,
      otpData: req.session?.otp
    });

    const { code } = req.body;
    const sessionOtp = req.session?.otp;

    if (!sessionOtp || !code) {
      console.log("Validation failed:", { hasSessionOtp: !!sessionOtp, hasCode: !!code });
      return res.status(400).json({ error: 'Invalid request - missing OTP data' });
    }

    // Check expiration (10 minutes)
    if (Date.now() - sessionOtp.timestamp > 10 * 60 * 1000) {
      delete req.session.otp;
      await req.session.save();
      return res.status(400).json({ error: 'OTP expired' });
    }

    console.log("Comparing OTPs:", {
      submitted: code,
      expected: sessionOtp.code,
      action: sessionOtp.action
    });

    if (code !== sessionOtp.code) {
      return res.status(400).json({ error: 'Invalid OTP - codes do not match' });
    }

    if (sessionOtp.action === 'signup') {
      console.log("Starting signup completion...");
      
      // Check for existing user first
      const existingUser = await collection.findOne({ 
        $or: [
          { email: sessionOtp.email },
          { username: sessionOtp.username }
        ]
      });
      
      if (existingUser) {
        console.log("User already exists:", existingUser.email);
        return res.status(400).json({ 
          error: 'User with this email or username already exists' 
        });
      }
      
      try {
        // Create new user
        const hash = await bcrypt.hash(sessionOtp.password, 10);
        console.log("Password hashed successfully");
        
        const newUser = await collection.create({ 
          username: sessionOtp.username, 
          email: sessionOtp.email, 
          password: hash 
        });
        console.log("User created successfully:", newUser.email);
        
        // Clear OTP session after successful creation
        delete req.session.otp;
        await req.session.save();
        console.log("Session OTP cleared and saved");
        
        console.log("Sending redirect response");
        return res.status(200).json({ redirect: '/signin' });
      } catch (err) {
        console.error("User creation error:", err);
        return res.status(500).json({ error: "Failed to create user account" });
      }
    } 
    
    if (sessionOtp.action === 'signin') {
      try {
        const user = await collection.findById(sessionOtp.userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        req.session.user = user.email;
        delete req.session.otp;
        await req.session.save();
        
        const username = user.email.toLowerCase().split('@')[0];
        const redirect = username.includes('admin') ? '/admin' : '/destination';
        return res.status(200).json({ redirect });
      } catch (err) {
        console.error("Signin completion error:", err);
        return res.status(500).json({ error: "Failed to complete signin" });
      }
    }

    // If we get here, action was neither signup nor signin
    return res.status(400).json({ error: 'Invalid OTP action' });

  } catch (err) {
    console.error('OTP verification error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    return res.status(500).json({ error: `Server error during OTP verification` });
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
    res.json({ message: 'OTP resent' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend OTP' });
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
app.listen(PORT, (err) => {
  if (err) {
    if (err.code === 'EADDRINUSE') {
      // Try alternative port
      console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
      app.listen(PORT + 1, () => {
        console.log(`Server running on Port: ${PORT + 1}`);
      });
    } else {
      console.error('Server error:', err);
    }
  } else {
    console.log(`Server running on Port: ${PORT}`);
  }
});