import express from "express";
import path from "path";
import bcrypt from "bcrypt";
import collection from "./config.js";

const app = express();
app.use(express.static(path.join(process.cwd(), "public")));
// set view engine
app.set("view engine", "ejs");

// routes
app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/destination", (req, res) => {
  res.render("destination");
});

// start server
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on Port: ${PORT}`);
});