### **Employee Access Simulator**

***

### **Overview**

The **Employee Access Simulator** helps HR and security teams simulate and manage employee access requests to secure rooms. It loads access data from a JSON file and displays it in a clear, sortable table.

***

### **Features**

- Load employee access requests from a `employees.json` file.
- Display all requests, including duplicates, in an HTML table.
- Buttons for **Load Employees** (toggle data display), **Simulate Access** (show granted/denied access), and **Clear** (clear all content).
- Clear separation of HTML, CSS, and JavaScript for maintainability.

***

### **Tech Stack**

- **Backend:** Node.js, Express.js  
- **Frontend:** HTML, CSS, JavaScript  
- **Data:** Static `employees.json` file  
- **Testing:** Jest and Supertest

***

### **Folder Structure**

```
project-root/
│
├─ backend/
│ ├─ index.js               # Express server entry point
│ ├─ allocation.js          # Access simulation logic
│ ├─ rules.js               # Room rules definitions
│ └─ tests/                 # Contains Jest test files
│    ├─ allocation.test.js  # Access simulation tests
│    └─ index.test.js       # API endpoint tests
├─ data/
│    └─ employees.json      # Static employee data file
│
├─ frontend/
│ ├─ index.html             # Main HTML page
│ ├─ script.js              # Frontend JavaScript logic
│ └─ style.css              # CSS styling
│
├─ README.md                # Project documentation
├─ .gitignore               # Git ignore rules
├─ package.json             # NPM package configuration (includes scripts)
└─ package-lock.json        # Lockfile for dependency versions
```

***

### **How to Run**

1. Clone the repository:
   ```bash
   git clone <https://github.com/Rafiya-Rehan21/employee-access-simulator-innovaxel.git>
   ```
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start the backend server in development mode with automatic reloads (nodemon):
   ```bash
   npm run dev
   ```
4. Open the frontend:
   The frontend is served via backend/index.js, so you don’t need to run it separately.
   You can also open frontend/index.html directly in a browser or via a Live Server extension for testing.
   
5. View the data:
   Click the **Load Employees** button to display employee requests.  
   Click the **Simulate Access** button to display access results.  

### **Testing**

- Backend API is tested using **Jest** and **Supertest**.
- Tests cover employee data retrieval, room rules, and access simulation endpoints.
- To run the tests:
  ```bash
  npm install --save-dev jest supertest
  npm test
  ```
- Tests are located inside the `backend/tests/` folder and ensure API reliability and simulation accuracy.

### License
This project is created for educational purposes and personal learning. Not intended for commercial use.

***