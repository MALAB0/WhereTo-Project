// Load environment variables
require('dotenv').config();
const { MongoClient } = require('mongodb');

// Get the connection URI from .env
const uri = process.env.MONGODB_URI;

// Create MongoDB client
const client = new MongoClient(uri);

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // Choose the database and collection
    const db = client.db("transportDB");
    const routes = db.collection("routes");

    // Insert a sample route
    const result = await routes.insertOne({
      route_name: "Route A",
      start_point: "Manila",
      destination: "Quezon City",
      distance_km: 15,
      estimated_time_mins: 45
    });

    console.log("✅ Route inserted with ID:", result.insertedId);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  } finally {
    // Close connection
    await client.close();
    console.log("🔒 Connection closed");
  }
}

run();
