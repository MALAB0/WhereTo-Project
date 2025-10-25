import express from "express";
import path from "path";
import bcrypt from "bcrypt";
import collection from "./config.js";
import { name } from "ejs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.static(path.join(process.cwd(), "src")));

// routes
app.get("/signin", (req, res) => {res.render("signin");});
app.get("/signup", (req, res) => {res.render("signup");});
app.get("/about", (req, res) => {res.render("about");});

app.get("/homepage", (req, res) => {res.render("homepage");});
app.get("/destination", (req, res) => {res.render("destination");});
app.get("/livemap", (req, res) => {res.render("LiveMap");});
app.get("/report", (req, res) => {res.render("report");});
app.get("/notification", (req, res) => {res.render("notification");});
app.get("/nav", (req, res) => {res.render("navigation");});
app.get("/route", (req, res) => {res.render("route");});
app.get("/profile", (req, res) => {res.render("profile");});
app.get("/prof2", (req, res) => {res.render("profile2");});

app.get("/admin", (req, res) => {res.render("admin");});
app.get("/commuters", (req, res) => {res.render("commuters");});
app.get("/aprof", (req, res) => {res.render("aprofile");});
app.get("/reportadmin", (req, res) => {res.render("reportadmin");});
app.get("/routem", (req, res) => {res.render("routemanage");});
app.get("/userm", (req, res) => {res.render("usermanage");});
app.get("/cpass", (req, res) => {res.render("changepass");});

app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find({});
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.get("/livemap", (req, res) => { res.render("LiveMap"); });

app.get('/api/location', async (req, res) => {
  try {
    // Replace with: fetch your external location API, database, etc.
    res.json({
      lat: 16.0346255,
      lng: 120.3355079,
      zoom: 13
    });
  } catch (err) {
    console.error('Location API error', err);
    res.status(500).json({ error: 'Failed to get location' });
  }
});

app.post('/api/savedroutes', async (req, res) => {
  try {
    const data = new SavedRoute(req.body);
    await data.save();
    res.json({ message: "✅ Saved route added!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trips', async (req, res) => {
  try {
    const data = new Trip(req.body);
    await data.save();
    res.json({ message: "✅ Trip added!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/signup", async (req, res) => {console.log("POST /signup hit", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    console.warn("Missing email or password");
    return res.status(400).send("Missing email or password");
  }

  try {
    // check duplicate
    const existing = await collection.findOne({ email });
    if (existing) return res.status(400).send("User already exists");

    // hash password then create
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
    
    // Check if user is admin based on email
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

// start server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on Port: ${PORT}`);
});