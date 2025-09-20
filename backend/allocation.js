const { roomRules } = require('./rules');

class AccessSimulator {
  constructor() {
    // Track last access time for each employee-room combination
    this.lastAccessTimes = new Map();
  }

  /**
   * Convert time string (HH:MM) to minutes since midnight
   * @param {string} timeStr - Time in format "HH:MM"
   * @returns {number} Minutes since midnight
   */
  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Check if current time is within room's operating hours
   * @param {string} requestTime - Time in format "HH:MM"
   * @param {Object} room - Room configuration object
   * @returns {boolean} True if room is open at request time
   */
  isRoomOpen(requestTime, room) {
    const requestMinutes = this.timeToMinutes(requestTime);
    const openMinutes = this.timeToMinutes(room.openTime);
    const closeMinutes = this.timeToMinutes(room.closeTime);
    
    return requestMinutes >= openMinutes && requestMinutes <= closeMinutes;
  }

  /**
   * Check if employee has sufficient access level for the room
   * @param {number} employeeLevel - Employee's access level
   * @param {Object} room - Room configuration object
   * @returns {boolean} True if employee has sufficient access level
   */
  hasValidAccessLevel(employeeLevel, room) {
    return employeeLevel >= room.minAccessLevel;
  }

  /**
   * Check if employee is within cooldown period for the room
   * @param {string} employeeId - Employee ID
   * @param {string} roomName - Room name
   * @param {string} requestTime - Current request time
   * @param {number} cooldownMinutes - Cooldown period in minutes
   * @returns {boolean} True if employee is within cooldown period
   */
  isInCooldown(employeeId, roomName, requestTime, cooldownMinutes) {
    const accessKey = `${employeeId}-${roomName}`;
    const lastAccessTime = this.lastAccessTimes.get(accessKey);
    
    if (!lastAccessTime) {
      return false; // No previous access
    }
    
    const currentMinutes = this.timeToMinutes(requestTime);
    const lastAccessMinutes = this.timeToMinutes(lastAccessTime);
    const timeDifference = currentMinutes - lastAccessMinutes;
    
    return timeDifference < cooldownMinutes;
  }

  /**
   * Record successful access for cooldown tracking
   * @param {string} employeeId - Employee ID
   * @param {string} roomName - Room name
   * @param {string} accessTime - Time of access
   */
  recordAccess(employeeId, roomName, accessTime) {
    const accessKey = `${employeeId}-${roomName}`;
    this.lastAccessTimes.set(accessKey, accessTime);
  }

  /**
   * Simulate access for a single employee request
   * @param {Object} request - Employee access request
   * @returns {Object} Result object with granted status and reason
   */
  simulateEmployeeAccess(request) {
    const { id, access_level, request_time, room } = request;
    const roomConfig = roomRules[room];

    // Check if room exists in configuration
    if (!roomConfig) {
      return {
        employeeId: id,
        room: room,
        requestTime: request_time,
        granted: false,
        reason: `Room '${room}' not found in system`
      };
    }

    // Check access level requirement
    if (!this.hasValidAccessLevel(access_level, roomConfig)) {
      return {
        employeeId: id,
        room: room,
        requestTime: request_time,
        granted: false,
        reason: `Access denied: Insufficient access level (required: ${roomConfig.minAccessLevel}, has: ${access_level})`
      };
    }

    // Check if room is open
    if (!this.isRoomOpen(request_time, roomConfig)) {
      return {
        employeeId: id,
        room: room,
        requestTime: request_time,
        granted: false,
        reason: `Access denied: Room closed (open: ${roomConfig.openTime}-${roomConfig.closeTime}, requested: ${request_time})`
      };
    }

    // Check cooldown period
    if (this.isInCooldown(id, room, request_time, roomConfig.cooldown)) {
      const accessKey = `${id}-${room}`;
      const lastAccess = this.lastAccessTimes.get(accessKey);
      return {
        employeeId: id,
        room: room,
        requestTime: request_time,
        granted: false,
        reason: `Access denied: Cooldown period active (last access: ${lastAccess}, cooldown: ${roomConfig.cooldown} minutes)`
      };
    }

    // Access granted - record the access time
    this.recordAccess(id, room, request_time);
    
    return {
      employeeId: id,
      room: room,
      requestTime: request_time,
      granted: true,
      reason: `Access granted to ${room}`
    };
  }

  /**
   * Simulate access for multiple employee requests
   * @param {Array} employees - Array of employee access requests
   * @returns {Array} Array of access results
   */
  simulateAccess(employees) {
    // Sort employees by request time to process in chronological order
    const sortedEmployees = [...employees].sort((a, b) => {
      return this.timeToMinutes(a.request_time) - this.timeToMinutes(b.request_time);
    });

    const results = [];
    
    for (const employee of sortedEmployees) {
      const result = this.simulateEmployeeAccess(employee);
      results.push(result);
    }

    return results;
  }

  /**
   * Reset the simulator state (clear all access history)
   */
  reset() {
    this.lastAccessTimes.clear();
  }

  /**
   * Get summary statistics of the simulation
   * @param {Array} results - Array of simulation results
   * @returns {Object} Summary statistics
   */
  getSimulationSummary(results) {
    const totalRequests = results.length;
    const grantedRequests = results.filter(r => r.granted).length;
    const deniedRequests = totalRequests - grantedRequests;

    const denialReasons = {};
    results
      .filter(r => !r.granted)
      .forEach(r => {
        const reasonType = r.reason.split(':')[0] + ':';
        denialReasons[reasonType] = (denialReasons[reasonType] || 0) + 1;
      });

    return {
      totalRequests,
      grantedRequests,
      deniedRequests,
      successRate: ((grantedRequests / totalRequests) * 100).toFixed(1) + '%',
      denialReasons
    };
  }
}

module.exports = { AccessSimulator };