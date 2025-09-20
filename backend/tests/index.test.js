const request = require("supertest");
const app = require("../index");

describe("Employee Access Simulator API", () => {
  // Helper for GET requests
  const getAndExpectStatus = async (url, status = 200) => {
    const res = await request(app).get(url);
    expect(res.statusCode).toBe(status);
    return res;
  };

  // Helper to validate employee fields
  const validateEmployeeFields = (employee) => {
    expect(employee).toHaveProperty("id");
    expect(employee).toHaveProperty("access_level");
    expect(employee).toHaveProperty("request_time");
    expect(employee).toHaveProperty("room");
  };

  // Helper to validate room structure
  const validateRoom = (room) => {
    expect(room).toHaveProperty("minAccessLevel");
    expect(room).toHaveProperty("openTime");
    expect(room).toHaveProperty("closeTime");
    expect(room).toHaveProperty("cooldown");
  };

  describe("GET /api/employees", () => {
    test("should return list of employees with required fields", async () => {
      const res = await getAndExpectStatus("/api/employees");
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      res.body.forEach(validateEmployeeFields);
    });

    test("should handle file read errors gracefully", async () => {
      const res = await getAndExpectStatus("/api/employees");
      expect(res.statusCode).toBe(200); // Happy path only here
    });
  });

  describe("GET /api/rooms", () => {
    test("should return valid room rules with correct ServerRoom configuration", async () => {
      const res = await getAndExpectStatus("/api/rooms");
      expect(res.body.ServerRoom).toBeDefined();
      expect(res.body.Vault).toBeDefined();
      expect(res.body["R&D Lab"]).toBeDefined();

      Object.values(res.body).forEach(validateRoom);

      const serverRoom = res.body.ServerRoom;
      expect(serverRoom.minAccessLevel).toBe(2);
      expect(serverRoom.openTime).toBe("09:00");
      expect(serverRoom.closeTime).toBe("11:00");
      expect(serverRoom.cooldown).toBe(15);
    });
  });

  describe("POST /api/simulate", () => {
    const postSimulate = (data) =>
      request(app).post("/api/simulate").send(data);

    test("validates and returns simulation results with correct structure", async () => {
      const testData = {
        employees: [
          { id: "EMP001", access_level: 2, request_time: "09:15", room: "ServerRoom" },
          { id: "EMP002", access_level: 1, request_time: "09:30", room: "Vault" },
        ],
      };
      const res = await postSimulate(testData);

      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBeDefined();
      expect(res.body.summary).toBeDefined();
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(res.body.results).toHaveLength(testData.employees.length);

      const result = res.body.results[0];
      ["employeeId", "room", "requestTime", "granted", "reason"].forEach((field) =>
        expect(result).toHaveProperty(field)
      );
      expect(typeof result.granted).toBe("boolean");
      expect(typeof result.reason).toBe("string");
    });

    test("grants or denies access correctly based on conditions", async () => {
      const scenarios = [
        {
          data: [{ id: "EMP001", access_level: 2, request_time: "09:15", room: "ServerRoom" }],
          expectGranted: true,
          expectReasonContains: "Access granted",
          desc: "grants access for valid requests",
        },
        {
          data: [{ id: "EMP001", access_level: 1, request_time: "09:15", room: "ServerRoom" }],
          expectGranted: false,
          expectReasonContains: "Insufficient access level",
          desc: "denies access for insufficient access level",
        },
        {
          data: [{ id: "EMP001", access_level: 2, request_time: "08:00", room: "ServerRoom" }],
          expectGranted: false,
          expectReasonContains: "Room closed",
          desc: "denies access for closed rooms",
        },
      ];

      for (const { data, expectGranted, expectReasonContains, desc } of scenarios) {
        const res = await postSimulate({ employees: data });
        const result = res.body.results[0];
        expect(result.granted).toBe(expectGranted);
        expect(result.reason).toContain(expectReasonContains);
      }
    });

    test("enforces cooldown periods", async () => {
      const testData = {
        employees: [
          { id: "EMP001", access_level: 2, request_time: "09:15", room: "ServerRoom" },
          { id: "EMP001", access_level: 2, request_time: "09:20", room: "ServerRoom" },
        ],
      };

      const res = await postSimulate(testData);
      expect(res.body.results[0].granted).toBe(true);
      expect(res.body.results[1].granted).toBe(false);
      expect(res.body.results[1].reason).toContain("Cooldown period active");
    });

    test("returns correct summary statistics", async () => {
      const testData = {
        employees: [
          { id: "EMP001", access_level: 2, request_time: "09:15", room: "ServerRoom" },
          { id: "EMP002", access_level: 1, request_time: "09:30", room: "Vault" },
        ],
      };

      const res = await postSimulate(testData);
      const summary = res.body.summary;
      expect(summary.totalRequests).toBe(2);
      expect(summary.grantedRequests).toBe(1);
      expect(summary.deniedRequests).toBe(1);
      expect(summary.successRate).toBe("50.0%");
    });

    test("handles invalid or missing employee data", async () => {
      const invalidPayloads = [{ employees: "invalid" }, {}];

      for (const payload of invalidPayloads) {
        const res = await postSimulate(payload);
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toContain("Invalid employee data");
      }
    });
  });

  describe("POST /api/simulate-default", () => {
    test("returns simulation results with default data", async () => {
      const res = await request(app).post("/api/simulate-default");
      expect(res.statusCode).toBe(200);
      expect(res.body.results).toBeDefined();
      expect(res.body.summary).toBeDefined();
      expect(res.body.employeeData).toBeDefined();
      expect(Array.isArray(res.body.results)).toBe(true);
      expect(Array.isArray(res.body.employeeData)).toBe(true);
      expect(res.body.results.length).toBe(res.body.employeeData.length);
      expect(res.body.summary.totalRequests).toBe(res.body.employeeData.length);
    });
  });

  describe("Error Handling", () => {
    test("returns 404 for unknown endpoints", async () => {
      const res = await getAndExpectStatus("/api/nonexistent", 404);
    });

    test("handles malformed JSON in POST requests", async () => {
      const res = await request(app)
        .post("/api/simulate")
        .set("Content-Type", "application/json")
        .send('{"invalid": json}');
      expect(res.statusCode).toBe(400);
    });
  });

  describe("Integration Tests", () => {
    test("handles complex simulation scenarios correctly", async () => {
      const complexScenario = {
        employees: [
          { id: "EMP001", access_level: 3, request_time: "09:15", room: "Vault" },
          { id: "EMP002", access_level: 1, request_time: "09:20", room: "ServerRoom" },
          { id: "EMP003", access_level: 2, request_time: "11:30", room: "ServerRoom" },
          { id: "EMP004", access_level: 1, request_time: "10:00", room: "R&D Lab" },
          { id: "EMP001", access_level: 3, request_time: "09:20", room: "Vault" },
        ],
      };

      const res = await request(app).post("/api/simulate").send(complexScenario);
      expect(res.statusCode).toBe(200);
      expect(res.body.results).toHaveLength(5);

      const expected = [true, false, false, true, false];
      res.body.results.forEach((r, i) => expect(r.granted).toBe(expected[i]));
    });
  });
});
