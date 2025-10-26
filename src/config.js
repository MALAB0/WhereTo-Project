import mongoose from "mongoose";

mongoose.connect('mongodb://127.0.0.1:27017/loginusers', {  // Replace with your MongoDB URI
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));
  
const SigninSchema = new mongoose.Schema({
  email: {type: String,required: true},
  password: {type: String,required: true}
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


const collection = mongoose.model("users", SigninSchema);
const Rcollection = mongoose.model("reports", reportSchema);

console.log("User model ready ->", collection.collection.name);
console.log("Report model ready ->", Rcollection.collection.name);

export default collection;
export { Rcollection };