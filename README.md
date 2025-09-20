### **Employee Access Simulator**

-----

### **Overview**

The **Employee Access Simulator** is an internal tool for HR and security teams to simulate and manage employee access requests to secure rooms. It loads employee access data from a JSON file and displays it in a clear, sortable table.

-----

### **Features**

  * **Load Data:** Fetches employee access requests from a `employees.json` file.
  * **Dynamic Display:** Renders all requests, including duplicate entries, in an HTML table.
  * **User Interface:** A single button, **Load Employees**, controls the visibility of the data table.
  * **Modular Code:** Separates HTML, CSS, and JavaScript for improved readability and maintenance.

-----

### **Tech Stack**

  * **Backend:** Node.js, Express.js
  * **Frontend:** HTML, CSS, JavaScript
  * **Data:** Static `employees.json` file

-----

### **Folder Structure**

```
project-root/
│
├─ backend/
│ ├─ index.js # Express server
│ └─ employees.json # Employee data
│
├─ frontend/
│ ├─ index.html # Main HTML page
│ ├─ script.js # Frontend logic
│ └─ style.css # Styling
│
├─ README.md # Project documentation
└─ .gitignore # Files to ignore in git
```

-----

### **How to Run**

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    ```
2.  **Install backend dependencies:**
    ```bash
    cd backend
    npm install express
    ```
3.  **Start the backend server:**
    ```bash
    node index.js
    ```
4.  **Open the frontend:**
    Open `frontend/index.html` in your web browser or use a local server like Live Server.
5.  **View the data:**
    Click the **Load Employees** button to display the list of employee access requests.