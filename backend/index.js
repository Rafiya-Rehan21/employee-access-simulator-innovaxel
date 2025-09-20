const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Route to fetch employees
app.get("/api/employees", (req, res) => {
  fs.readFile(path.join(__dirname, "../data/employees.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to load employees" });
    }
    res.json(JSON.parse(data));
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
