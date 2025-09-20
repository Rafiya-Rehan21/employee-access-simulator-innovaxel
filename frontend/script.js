const button = document.getElementById("loadEmployees");
const tableContainer = document.getElementById("tableContainer");
const tbody = document.querySelector("#employeeTable tbody");

let tableVisible = false; // track state

button.addEventListener("click", async () => {
  if (!tableVisible) {
    try {
      const res = await fetch("/api/employees");
      const employees = await res.json();

      tbody.innerHTML = ""; // clear old rows
      employees.forEach(emp => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${emp.id}</td>
          <td>${emp.access_level}</td>
          <td>${emp.request_time}</td>
          <td>${emp.room}</td>
        `;
        tbody.appendChild(row);
      });

      tableContainer.style.display = "block";
      button.textContent = "Hide Employees"; // change button label
      tableVisible = true;
    } catch (err) {
      console.error("Error loading employees:", err);
    }
  } else {
    // Hide and clear
    tableContainer.style.display = "none";
    tbody.innerHTML = "";
    button.textContent = "Load Employees"; // reset button label
    tableVisible = false;
  }
});
