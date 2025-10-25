import mongoose from "mongoose";
mongoose.connect("mongodb://127.0.0.1:27017/loginusers")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
  
const SigninSchema = new mongoose.Schema({
  email: {type: String,required: true},
  password: {type: String,required: true}
});

const reportSchema = new mongoose.Schema({
  reports:{ type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const collection = mongoose.model("users", SigninSchema);
const Rcollection = mongoose.model("reports", reportSchema);

console.log("User model ready ->", collection.collection.name);
console.log("Report model ready ->", Rcollection.collection.name);

export default collection;
export { Rcollection };