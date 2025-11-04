import mongoose from "mongoose";

mongoose.connect('mongodb://127.0.0.1:27017/loginusers', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
  
const SigninSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'active' },  // New: 'active' or 'suspended'
  role: { type: String, default: 'user' },     // New: 'user' or 'admin'
  preferences: {    
    notifications: { type: Boolean, default: true },
    autoSave: { type: Boolean, default: true },
    offline: { type: Boolean, default: false },
  },
  // Track how many trips the user has completed via navigation
  tripsTaken: { type: Number, default: 0 },
});

const reportSchema = new mongoose.Schema({
  issueType: { type: String, required: true },
  location: { type: String, required: true },
  affectedRoute: { type: String },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  user: { type: String, default: 'Anonymous' } 
});

// New schema for routes
const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  fare: {type: Number, require: true},
  travelTime: { type: String, default: '' },
  steps: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const searchSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, default: Date.now },
});


const collection = mongoose.model("users", SigninSchema);
const Rcollection = mongoose.model("reports", reportSchema);
const Route = mongoose.model("routes", routeSchema);
const Search = mongoose.model("searches", searchSchema);

console.log("User model ready ->", collection.collection.name);
console.log("Report model ready ->", Rcollection.collection.name);
console.log("Route model ready ->", Route.collection.name);
console.log("Search model ready ->", Search.collection.name);

export default collection;
export { Rcollection, Route, Search};