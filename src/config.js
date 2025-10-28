import mongoose from "mongoose";

mongoose.connect('mongodb://127.0.0.1:27017/loginusers', {  // Replace with your MongoDB URI
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
  
const SigninSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },  // Added unique for email too, if not already
  password: { type: String, required: true }
});

const reportSchema = new mongoose.Schema({
  reports:{ type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Add other fields like name, etc.
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// New schema for routes
const routeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  steps: [{ type: String }],
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