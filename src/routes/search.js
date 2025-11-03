import express from 'express';
import { Search } from '../config.js';

const router = express.Router();

// Record a new search
router.post("/", async (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: "Missing 'from' or 'to'" });
    }

    await Search.create({ from, to });
    console.log(`📍 New route searched: ${from} → ${to}`);
    res.status(201).json({ message: "Search recorded" });
  } catch (err) {
    console.error("Search save error:", err);
    res.status(500).json({ error: "Failed to save search" });
  }
});

// Get search statistics (case-insensitive)
router.get("/stats", async (req, res) => {
  try {
    const stats = await Search.aggregate([
      {
        $addFields: {
          lowerFrom: { $toLower: "$from" },
          lowerTo: { $toLower: "$to" }
        }
      },
      {
        $group: {
          _id: { 
            from: "$from", // Keep original case for display
            to: "$to",     // Keep original case for display
            lowerFrom: "$lowerFrom", // Used for case-insensitive grouping
            lowerTo: "$lowerTo"      // Used for case-insensitive grouping
          },
          count: { $sum: 1 },
          // Keep one example of original capitalization
          displayFrom: { $first: "$from" },
          displayTo: { $first: "$to" }
        }
      },
      {
        $group: {
          _id: {
            from: "$_id.lowerFrom",
            to: "$_id.lowerTo"
          },
          count: { $sum: "$count" },
          // Keep nicest capitalization (first occurrence)
          displayFrom: { $first: "$displayFrom" },
          displayTo: { $first: "$displayTo" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      // Restructure for backwards compatibility
      {
        $project: {
          _id: {
            from: "$displayFrom",
            to: "$displayTo"
          },
          count: 1
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    console.error("Stats fetch error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;