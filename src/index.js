import express from "express";
import path from "path";
import bcrypt from "bcrypt";
import collection from "./config.js";
import { name } from "ejs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

// set view engine
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));

// routes
app.get("/signin", (req, res) => {res.render("signin");});
app.get("/signup", (req, res) => {res.render("signup");});
app.get("/destination", (req, res) => {res.render("destination");});
app.get("/report", (req, res) => {res.render("report");});
app.get("/livemap", (req, res) => {res.render("LiveMap");});
app.get("/nav", (req, res) => {res.render("navigation");});
app.get("/route", (req, res) => {res.render("route");});
app.get("/profile", (req, res) => {res.render("profile");});

app.post("/signup", async (req, res)=> {
  const data = {
    name: req.body.email,
    password: req.body.password
  }

  const userdata = await collection.insrtMany(data);  
  console.log(userdata);
});
// start server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on Port: ${PORT}`);
});