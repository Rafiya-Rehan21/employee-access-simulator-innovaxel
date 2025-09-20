const { AccessSimulator } = require('../allocation');

describe('AccessSimulator', () => {
  let simulator;

  beforeEach(() => {
    simulator = new AccessSimulator();
  });

  // Helper to generate a valid employee request
  const makeRequest = (overrides = {}) => ({
    id: 'EMP001',
    access_level: 2,
    request_time: '09:15',
    room: 'ServerRoom',
    ...overrides,
  });

  describe('timeToMinutes', () => {
    test.each([
      ['09:15', 555],
      ['10:30', 630],
      ['00:00', 0],
      ['23:59', 1439],
    ])('converts %s to %i minutes', (time, expected) => {
      expect(simulator.timeToMinutes(time)).toBe(expected);
    });
  });

  describe('isRoomOpen', () => {
    const mockRoom = { openTime: '09:00', closeTime: '17:00' };

    test.each([
      ['10:00', true],
      ['09:00', true],
      ['17:00', true],
      ['08:59', false],
      ['17:01', false],
      ['23:00', false],
    ])('check room open at %s expected %s', (time, expected) => {
      expect(simulator.isRoomOpen(time, mockRoom)).toBe(expected);
    });
  });

  describe('hasValidAccessLevel', () => {
    const mockRoom = { minAccessLevel: 2 };

    test.each([
      [2, true],
      [3, true],
      [1, false],
      [0, false],
    ])('access level %i expected %s', (level, expected) => {
      expect(simulator.hasValidAccessLevel(level, mockRoom)).toBe(expected);
    });
  });

  describe('isInCooldown', () => {
    test('first access returns false', () => {
      expect(simulator.isInCooldown('EMP001', 'ServerRoom', '09:15', 15)).toBe(false);
    });

    test('tracks cooldown by employee and room', () => {
      simulator.recordAccess('EMP001', 'ServerRoom', '09:15');
      expect(simulator.isInCooldown('EMP001', 'ServerRoom', '09:25', 15)).toBe(true);
      expect(simulator.isInCooldown('EMP001', 'Vault', '09:25', 15)).toBe(false);
      expect(simulator.isInCooldown('EMP002', 'ServerRoom', '09:25', 15)).toBe(false);
      expect(simulator.isInCooldown('EMP001', 'ServerRoom', '09:35', 15)).toBe(false);
    });
  });

  describe('simulateEmployeeAccess', () => {
    test('grants access for valid request', () => {
      const result = simulator.simulateEmployeeAccess(makeRequest());
      expect(result.granted).toBe(true);
      expect(result.reason).toContain('Access granted');
    });

    test.each([
      [{ room: 'NonExistentRoom' }, false, 'not found in system'],
      [{ access_level: 1 }, false, 'Insufficient access level'],
      [{ request_time: '08:00' }, false, 'Room closed'],
    ])(
      'denies access for %p',
      (overrides, expectedGrant, reasonContains) => {
        const result = simulator.simulateEmployeeAccess(makeRequest(overrides));
        expect(result.granted).toBe(expectedGrant);
        expect(result.reason).toContain(reasonContains);
      }
    );

    test('denies access during cooldown period', () => {
      simulator.simulateEmployeeAccess(makeRequest());
      const secondResult = simulator.simulateEmployeeAccess(makeRequest({ request_time: '09:25' }));
      expect(secondResult.granted).toBe(false);
      expect(secondResult.reason).toContain('Cooldown period active');
    });
  });

  describe('simulateAccess', () => {
    test('processes requests in chronological order', () => {
      const employees = [
        { id: 'EMP002', access_level: 2, request_time: '09:30', room: 'ServerRoom' },
        { id: 'EMP001', access_level: 2, request_time: '09:15', room: 'ServerRoom' },
      ];
      const results = simulator.simulateAccess(employees);
      expect(results.map(r => r.employeeId)).toEqual(['EMP001', 'EMP002']);
      expect(results.map(r => r.requestTime)).toEqual(['09:15', '09:30']);
    });

    test('handles complex scenarios', () => {
      const employees = [
        { id: 'EMP001', access_level: 3, request_time: '09:15', room: 'Vault' },
        { id: 'EMP002', access_level: 1, request_time: '09:20', room: 'R&D Lab' },
        { id: 'EMP001', access_level: 3, request_time: '09:25', room: 'Vault' },
        { id: 'EMP003', access_level: 1, request_time: '09:30', room: 'ServerRoom' },
      ];
      const results = simulator.simulateAccess(employees);
      const expected = [true, true, false, false];
      expect(results.map(r => r.granted)).toEqual(expected);
    });

    test('handles duplicate IDs at different times', () => {
      const employees = [
        makeRequest(),
        makeRequest({ request_time: '09:35' }),
      ];
      const results = simulator.simulateAccess(employees);
      expect(results.every(r => r.granted)).toBe(true);
    });
  });

  describe('getSimulationSummary', () => {
    test.each([
      [
        [
          { granted: true, reason: 'Access granted to ServerRoom' },
          { granted: false, reason: 'Insufficient access level' },
          { granted: false, reason: 'Room closed' },
          { granted: true, reason: 'Access granted to R&D Lab' },
        ],
        { totalRequests: 4, grantedRequests: 2, deniedRequests: 2, successRate: '50.0%' },
      ],
      [
        [
          { granted: true, reason: 'Access granted to ServerRoom' },
          { granted: true, reason: 'Access granted to R&D Lab' },
        ],
        { totalRequests: 2, grantedRequests: 2, deniedRequests: 0, successRate: '100.0%' },
      ],
      [
        [
          { granted: false, reason: 'Insufficient access level' },
          { granted: false, reason: 'Room closed' },
        ],
        { totalRequests: 2, grantedRequests: 0, deniedRequests: 2, successRate: '0.0%' },
      ],
    ])('calculates summary for results %#', (results, expected) => {
      const summary = simulator.getSimulationSummary(results);
      expect(summary).toMatchObject(expected);
    });
  });

  describe('reset', () => {
    test('clears access history', () => {
      simulator.recordAccess('EMP001', 'ServerRoom', '09:15');
      expect(simulator.isInCooldown('EMP001', 'ServerRoom', '09:25', 15)).toBe(true);
      simulator.reset();
      expect(simulator.isInCooldown('EMP001', 'ServerRoom', '09:25', 15)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('handles midnight transitions', () => {
      expect(simulator.timeToMinutes('00:00')).toBe(0);
      expect(simulator.timeToMinutes('23:59')).toBe(1439);
    });

    test('handles exact boundary times', () => {
      const result = simulator.simulateEmployeeAccess(makeRequest({ request_time: '09:00' }));
      expect(result.granted).toBe(true);
    });

    test('handles empty employee array', () => {
      const results = simulator.simulateAccess([]);
      expect(results).toHaveLength(0);
      const summary = simulator.getSimulationSummary(results);
      expect(summary.totalRequests).toBe(0);
    });
  });
});