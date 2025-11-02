import mongoose from "mongoose";

mongoose.connect('mongodb://127.0.0.1:27017/loginusers', {  // Replace with your MongoDB URI
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
  
const SigninSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  issueType: { type: String, required: true },
  location: { type: String, required: true },
  affectedRoute: { type: String },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  user: { type: String, default: 'Anonymous' }  // New: User's email (or 'Anonymous' if not logged in)
});

// New schema for routes
const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  fare: {type: Number, require: true},
  steps: [{ type: String }],
  createdAt: { type: Date, default: Date.now },

       preferences: {
       notifications: { type: Boolean, default: true },
       location: { type: Boolean, default: true },
       autoSave: { type: Boolean, default: true },
       offline: { type: Boolean, default: false },
     },

  createdAt: { type: Date, default: Date.now }

});

const collection = mongoose.model("users", SigninSchema);
const Rcollection = mongoose.model("reports", reportSchema);
const Route = mongoose.model("routes", routeSchema);

console.log("User model ready ->", collection.collection.name);
console.log("Report model ready ->", Rcollection.collection.name);
console.log("Route model ready ->", Route.collection.name);

export default collection;
export { Rcollection, Route };