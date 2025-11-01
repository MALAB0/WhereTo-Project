import mongoose from "mongoose";

mongoose
  .connect("mongodb://127.0.0.1:27017/loginusers", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ====== USER SCHEMA ======
const SigninSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// ====== REPORT SCHEMA ======
const reportSchema = new mongoose.Schema({
  issueType: { type: String, required: true },
  location: { type: String, required: true },
  affectedRoute: { type: String },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
  user: { type: String, default: "Anonymous" },
});

// ====== ROUTE SCHEMA ======
const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  steps: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// ====== SEARCH SCHEMA (NEW for admin analytics) ======
const searchSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// ====== MODELS ======
const collection = mongoose.model("users", SigninSchema);
const Rcollection = mongoose.model("reports", reportSchema);
const Route = mongoose.model("routes", routeSchema);
const Search = mongoose.model("searches", searchSchema);

// ====== DEBUG LOGS ======
console.log("User model ready ->", collection.collection.name);
console.log("Report model ready ->", Rcollection.collection.name);
console.log("Route model ready ->", Route.collection.name);
console.log("Search model ready ->", Search.collection.name);

// ====== EXPORT MODELS ======
export default collection;
export { Rcollection, Route, Search };
