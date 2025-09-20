# Employee Access Simulator

---

## Overview

The **Employee Access Simulator** is an internal tool for HR and security teams to simulate and manage employee access requests to secure rooms in a building. The system loads employee access data, displays room access rules, and runs comprehensive simulations to determine whether access should be granted or denied based on security policies.

---

## Features

### Core Functionality
- **Load Employee Data:** Fetches employee access requests from `employees.json` file
- **Room Rules Display:** Shows access requirements, operating hours, and cooldown periods for each room
- **Access Simulation:** Runs comprehensive access simulation based on predefined security rules
- **Detailed Results:** Provides grant/deny decisions with specific reasons for each request
- **Summary Statistics:** Displays success rates, total requests, and denial reason breakdowns

### Security Rules
The system enforces three main access control rules:
1. **Access Level Verification:** Employee access level must meet or exceed room requirements
2. **Operating Hours:** Requests must fall within room's designated open hours
3. **Cooldown Periods:** Prevents repeat access within specified time windows per employee

### User Interface
- **Dynamic Data Display:** Real-time loading and rendering of employee requests
- **Interactive Controls:** Load, simulate, and clear data with responsive buttons
- **Visual Feedback:** Color-coded status indicators and comprehensive error handling
- **Responsive Design:** Mobile-friendly interface with adaptive layouts

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Data Storage:** JSON files for employee data and room configurations
- **Architecture:** RESTful API with separation of concerns

---

## Folder Structure

```
project-root/
│
├─ backend/
│  ├─ index.js          # Express server with API endpoints
│  ├─ allocation.js     # Access simulation logic and algorithms
│  └─ rules.js          # Room configuration and access rules
│
├─ data/
│  └─ employees.json    # Employee access request data
│
├─ frontend/
│  ├─ index.html        # Main application interface
│  ├─ script.js         # Frontend logic and API integration
│  └─ style.css         # Responsive styling and themes
│
├─ README.md            # Project documentation
└─ .gitignore          # Git ignore configuration
```

---

## Room Configuration

The system manages three secure areas with different access requirements:

| Room | Min Access Level | Operating Hours | Cooldown Period |
|------|-----------------|----------------|-----------------|
| **ServerRoom** | Level 2 | 09:00 - 11:00 | 15 minutes |
| **Vault** | Level 3 | 09:00 - 10:00 | 30 minutes |
| **R&D Lab** | Level 1 | 08:00 - 12:00 | 10 minutes |

---

## API Endpoints

### GET Endpoints
- `GET /api/employees` - Retrieve all employee access requests
- `GET /api/rooms` - Get room configuration and access rules

### POST Endpoints
- `POST /api/simulate` - Run access simulation with custom employee data
- `POST /api/simulate-default` - Run simulation using default employee dataset

### Response Format
```json
{
  "results": [
    {
      "employeeId": "EMP001",
      "room": "ServerRoom",
      "granted": true,
      "reason": "Access granted to ServerRoom"
    }
  ],
  "summary": {
    "totalRequests": 10,
    "grantedRequests": 7,
    "deniedRequests": 3,
    "successRate": "70.0%"
  }
}
```

---

## How to Run

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd employee-access-simulator
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install express
   ```

3. **Start the backend server:**
   ```bash
   node index.js
   ```
   Server will run on `http://localhost:3000`

4. **Access the application:**
   Open your web browser and navigate to `http://localhost:3000`

### Usage Instructions

1. **Load Employee Data:** Click "Load Employees" to fetch and display employee requests
2. **View Room Rules:** System automatically displays access rules for all secure rooms  
3. **Run Simulation:** Click "Simulate Access" to process all requests and generate results
4. **Review Results:** Examine detailed grant/deny decisions with explanations
5. **Clear Data:** Use "Clear All" to reset the application state

---

## Sample Data

The system includes sample employee data with various scenarios:

```json
[
  {
    "id": "EMP001",
    "access_level": 2,
    "request_time": "09:15",
    "room": "ServerRoom"
  },
  {
    "id": "EMP002",
    "access_level": 1,
    "request_time": "09:30",
    "room": "Vault"
  }
]
```

---

## Access Decision Logic

The simulation processes requests chronologically and applies the following validation:

1. **Room Validation:** Verify the requested room exists in the system
2. **Access Level Check:** Compare employee level with room requirements
3. **Time Window Verification:** Ensure request falls within operating hours
4. **Cooldown Enforcement:** Check for recent access by the same employee
5. **Result Generation:** Provide detailed explanation for each decision

---

## Development

### Key Components

- **AccessSimulator Class:** Core simulation engine with comprehensive access logic
- **Room Rules Configuration:** Centralized access policies and time management
- **API Layer:** RESTful endpoints with proper error handling
- **Frontend Interface:** Responsive UI with real-time data updates

### Testing

Test the API endpoints using curl or your preferred HTTP client:

```bash
# Test employee data loading
curl http://localhost:3000/api/employees

# Test room rules retrieval  
curl http://localhost:3000/api/rooms

# Test simulation with default data
curl -X POST http://localhost:3000/api/simulate-default
```

---

## Future Enhancements

- **Database Integration:** Replace JSON files with persistent database storage
- **User Authentication:** Add role-based access control for HR managers
- **Real-time Monitoring:** Live access request processing and notifications
- **Advanced Reporting:** Export simulation results and access analytics
- **Mobile Application:** Native mobile app for on-the-go access management

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## License

This project is developed for educational and demonstration purposes.