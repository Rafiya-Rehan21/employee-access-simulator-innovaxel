const express = require("express");
const path = require("path");
const fs = require("fs");
const { AccessSimulator } = require('./allocation');
const { roomRules } = require('./rules');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Initialize the access simulator
const simulator = new AccessSimulator();

// Route to fetch employees
app.get("/api/employees", (req, res) => {
  fs.readFile(path.join(__dirname, "../data/employees.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to load employees" });
    }
    res.json(JSON.parse(data));
  });
});

// Route to get room rules
app.get("/api/rooms", (req, res) => {
  res.json(roomRules);
});

// Route to simulate access
app.post("/api/simulate", (req, res) => {
  try {
    const { employees } = req.body;
    
    if (!employees || !Array.isArray(employees)) {
      return res.status(400).json({ error: "Invalid employee data provided" });
    }

    // Reset simulator state for fresh simulation
    simulator.reset();
    
    // Run the simulation
    const results = simulator.simulateAccess(employees);
    const summary = simulator.getSimulationSummary(results);
    
    res.json({
      results: results,
      summary: summary
    });
    
  } catch (error) {
    console.error('Error during simulation:', error);
    res.status(500).json({ error: "Failed to run access simulation" });
  }
});

// Route to simulate with default data
app.post("/api/simulate-default", (req, res) => {
  fs.readFile(path.join(__dirname, "../data/employees.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to load employee data" });
    }

    try {
      const employees = JSON.parse(data);
      
      // Reset simulator state
      simulator.reset();
      
      // Run simulation with default data
      const results = simulator.simulateAccess(employees);
      const summary = simulator.getSimulationSummary(results);
      
      res.json({
        results: results,
        summary: summary,
        employeeData: employees
      });
      
    } catch (error) {
      console.error('Error during simulation:', error);
      res.status(500).json({ error: "Failed to run simulation" });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;