// DOM Elements
const loadEmployeesBtn = document.getElementById("loadEmployees");
const simulateAccessBtn = document.getElementById("simulateAccess");
const clearAllBtn = document.getElementById("clearAll");
const tableContainer = document.getElementById("tableContainer");
const resultsContainer = document.getElementById("resultsContainer");
const loadingIndicator = document.getElementById("loadingIndicator");
const errorContainer = document.getElementById("errorContainer");
const tbody = document.querySelector("#employeeTable tbody");
const resultsTbody = document.querySelector("#resultsTable tbody");
const employeeCount = document.getElementById("employeeCount");
const summaryStats = document.getElementById("summaryStats");
const errorMessage = document.getElementById("errorMessage");

// State management
let employeesData = [];
let tableVisible = false;
let resultsVisible = false;

// Utility functions
function showError(message) {
  errorMessage.textContent = message;
  errorContainer.style.display = "block";
  setTimeout(() => {
    errorContainer.style.display = "none";
  }, 5000);
}

function formatTime(timeStr) {
  return timeStr;
}

function getStatusClass(granted) {
  return granted ? 'status-granted' : 'status-denied';
}

// Load employees function
async function loadEmployees() {
  try {
    loadingIndicator.style.display = "block";
    const response = await fetch("/api/employees");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    employeesData = await response.json();
    displayEmployees();

  } catch (error) {
    console.error("Error loading employees:", error);
    showError("Failed to load employees data");
  } finally {
    loadingIndicator.style.display = "none";
  }
}

// Display employees in table
function displayEmployees() {
  tbody.innerHTML = "";

  employeesData.forEach((emp) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.id}</td>
      <td class="access-level-${emp.access_level}">${emp.access_level}</td>
      <td>${formatTime(emp.request_time)}</td>
      <td class="room-${emp.room.replace(/\s+/g, '-').toLowerCase()}">${emp.room}</td>
    `;
    tbody.appendChild(row);
  });

  employeeCount.textContent = `Total Requests: ${employeesData.length}`;
  tableContainer.style.display = "block";
  simulateAccessBtn.disabled = false;
  tableVisible = true;

  // Update button text
  loadEmployeesBtn.textContent = "Reload Employees";
}

// Simulate access function
async function simulateAccess() {
  if (!employeesData.length) {
    showError("Please load employees first");
    return;
  }

  try {
    loadingIndicator.style.display = "block";
    simulateAccessBtn.disabled = true;

    const response = await fetch("/api/simulate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ employees: employeesData })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const simulationData = await response.json();
    displayResults(simulationData);

  } catch (error) {
    console.error("Error during simulation:", error);
    showError("Failed to run access simulation");
  } finally {
    loadingIndicator.style.display = "none";
    simulateAccessBtn.disabled = false;
  }
}

// Display simulation results
function displayResults(data) {
  const { results, summary } = data;

  // Clear previous results
  resultsTbody.innerHTML = "";
  summaryStats.innerHTML = "";

  // Display summary statistics
  const summaryHtml = `
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-number">${summary.totalRequests}</div>
        <div class="summary-label">Total Requests</div>
      </div>
      <div class="summary-item granted">
        <div class="summary-number">${summary.grantedRequests}</div>
        <div class="summary-label">Granted</div>
      </div>
      <div class="summary-item denied">
        <div class="summary-number">${summary.deniedRequests}</div>
        <div class="summary-label">Denied</div>
      </div>
      <div class="summary-item">
        <div class="summary-number">${summary.successRate}</div>
        <div class="summary-label">Success Rate</div>
      </div>
    </div>
  `;

  summaryStats.innerHTML = summaryHtml;

  // Display detailed results
  results.forEach((result) => {
    const row = document.createElement("tr");
    const statusClass = getStatusClass(result.granted);

    row.innerHTML = `
      <td>${result.employeeId}</td>
      <td class="room-${result.room.replace(/\s+/g, '-').toLowerCase()}">${result.room}</td>
      <td>${result.requestTime || 'N/A'}</td>
      <td class="${statusClass}">
        <span class="status-badge ${statusClass}">
          ${result.granted ? '✅ GRANTED' : '❌ DENIED'}
        </span>
      </td>
      <td class="reason">${result.reason}</td>
    `;
    resultsTbody.appendChild(row);
  });

  resultsContainer.style.display = "block";
  resultsVisible = true;
}

// Clear all data
function clearAll() {
  // Reset state
  employeesData = [];
  tableVisible = false;
  resultsVisible = false;

  // Hide all containers
  tableContainer.style.display = "none";
  resultsContainer.style.display = "none";
  errorContainer.style.display = "none";
  loadingIndicator.style.display = "none";

  // Clear content
  tbody.innerHTML = "";
  resultsTbody.innerHTML = "";
  summaryStats.innerHTML = "";
  employeeCount.textContent = "";

  // Reset buttons
  loadEmployeesBtn.textContent = "Load Employees";
  simulateAccessBtn.disabled = true;
}

// Event listeners
loadEmployeesBtn.addEventListener("click", () => {
  loadEmployees();
});

simulateAccessBtn.addEventListener("click", simulateAccess);
clearAllBtn.addEventListener("click", clearAll);

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  console.log("Employee Access Simulator initialized");
});
