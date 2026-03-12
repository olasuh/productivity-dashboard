/**
 * Unit Tests for Time Service
 * Tests specific examples and edge cases for time formatting, date formatting, and greeting logic
 */

// Import TimeService for testing
const TimeService = require('../../js/time-service.js');

describe('TimeService', () => {
    let timeService;

    beforeEach(() => {
        timeService = new TimeService();
    });

    afterEach(() => {
        timeService.stopUpdates();
    });

    describe('formatTime', () => {
        test('formats time in HH:MM:SS format with zero padding', () => {
            const testDate = new Date('2024-01-15T09:05:03');
            expect(timeService.formatTime(testDate)).toBe('09:05:03');
        });

        test('formats midnight correctly', () => {
            const testDate = new Date('2024-01-15T00:00:00');
            expect(timeService.formatTime(testDate)).toBe('00:00:00');
        });

        test('formats noon correctly', () => {
            const testDate = new Date('2024-01-15T12:00:00');
            expect(timeService.formatTime(testDate)).toBe('12:00:00');
        });

        test('formats late evening correctly', () => {
            const testDate = new Date('2024-01-15T23:59:59');
            expect(timeService.formatTime(testDate)).toBe('23:59:59');
        });

        test('uses current time when no date provided', () => {
            const result = timeService.formatTime();
            expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });
    });

    describe('formatDate', () => {
        test('formats date in "Day, Month DD, YYYY" format', () => {
            const testDate = new Date('2024-01-15T12:00:00');
            expect(timeService.formatDate(testDate)).toBe('Monday, January 15, 2024');
        });

        test('formats different months correctly', () => {
            const testDate = new Date('2024-12-25T12:00:00');
            expect(timeService.formatDate(testDate)).toBe('Wednesday, December 25, 2024');
        });

        test('formats single digit days correctly', () => {
            const testDate = new Date('2024-03-05T12:00:00');
            expect(timeService.formatDate(testDate)).toBe('Tuesday, March 5, 2024');
        });

        test('formats weekend days correctly', () => {
            const testDate = new Date('2024-01-14T12:00:00'); // Sunday
            expect(timeService.formatDate(testDate)).toBe('Sunday, January 14, 2024');
        });

        test('uses current date when no date provided', () => {
            const result = timeService.formatDate();
            expect(result).toMatch(/^\w+, \w+ \d{1,2}, \d{4}$/);
        });
    });

    describe('getGreeting', () => {
        test('returns "Good Morning" for 5:00 AM', () => {
            const testDate = new Date('2024-01-15T05:00:00');
            expect(timeService.getGreeting(testDate)).toBe('Good Morning');
        });

        test('returns "Good Morning" for 11:59 AM', () => {
            const testDate = new Date('2024-01-15T11:59:00');
            expect(timeService.getGreeting(testDate)).toBe('Good Morning');
        });

        test('returns "Good Afternoon" for 12:00 PM', () => {
            const testDate = new Date('2024-01-15T12:00:00');
            expect(timeService.getGreeting(testDate)).toBe('Good Afternoon');
        });

        test('returns "Good Afternoon" for 4:59 PM', () => {
            const testDate = new Date('2024-01-15T16:59:00');
            expect(timeService.getGreeting(testDate)).toBe('Good Afternoon');
        });

        test('returns "Good Evening" for 5:00 PM', () => {
            const testDate = new Date('2024-01-15T17:00:00');
            expect(timeService.getGreeting(testDate)).toBe('Good Evening');
        });

        test('returns "Good Evening" for 8:59 PM', () => {
            const testDate = new Date('2024-01-15T20:59:00');
            expect(timeService.getGreeting(testDate)).toBe('Good Evening');
        });

        test('returns "Good Night" for 9:00 PM', () => {
            const testDate = new Date('2024-01-15T21:00:00');
            expect(timeService.getGreeting(testDate)).toBe('Good Night');
        });

        test('returns "Good Night" for midnight', () => {
            const testDate = new Date('2024-01-15T00:00:00');
            expect(timeService.getGreeting(testDate)).toBe('Good Night');
        });

        test('returns "Good Night" for 4:59 AM', () => {
            const testDate = new Date('2024-01-15T04:59:00');
            expect(timeService.getGreeting(testDate)).toBe('Good Night');
        });

        test('uses current time when no date provided', () => {
            const result = timeService.getGreeting();
            expect(['Good Morning', 'Good Afternoon', 'Good Evening', 'Good Night']).toContain(result);
        });
    });

    describe('getCurrentTimeData', () => {
        test('returns object with time, date, greeting, and timestamp', () => {
            const result = timeService.getCurrentTimeData();
            
            expect(result).toHaveProperty('time');
            expect(result).toHaveProperty('date');
            expect(result).toHaveProperty('greeting');
            expect(result).toHaveProperty('timestamp');
            
            expect(result.time).toMatch(/^\d{2}:\d{2}:\d{2}$/);
            expect(result.date).toMatch(/^\w+, \w+ \d{1,2}, \d{4}$/);
            expect(['Good Morning', 'Good Afternoon', 'Good Evening', 'Good Night']).toContain(result.greeting);
            expect(result.timestamp).toBeInstanceOf(Date);
        });
    });

    describe('callback management', () => {
        test('can register and call callbacks', () => {
            const mockCallback = jest.fn();
            timeService.onUpdate(mockCallback);
            
            timeService.notifyCallbacks();
            
            expect(mockCallback).toHaveBeenCalledTimes(1);
            expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
                time: expect.stringMatching(/^\d{2}:\d{2}:\d{2}$/),
                date: expect.stringMatching(/^\w+, \w+ \d{1,2}, \d{4}$/),
                greeting: expect.stringMatching(/^Good (Morning|Afternoon|Evening|Night)$/),
                timestamp: expect.any(Date)
            }));
        });

        test('can remove callbacks', () => {
            const mockCallback = jest.fn();
            timeService.onUpdate(mockCallback);
            timeService.removeCallback(mockCallback);
            
            timeService.notifyCallbacks();
            
            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('ignores non-function callbacks', () => {
            expect(() => {
                timeService.onUpdate('not a function');
                timeService.onUpdate(null);
                timeService.onUpdate(undefined);
            }).not.toThrow();
        });

        test('handles callback errors gracefully', () => {
            const errorCallback = jest.fn(() => {
                throw new Error('Test error');
            });
            const goodCallback = jest.fn();
            
            timeService.onUpdate(errorCallback);
            timeService.onUpdate(goodCallback);
            
            // Should not throw and should still call good callback
            expect(() => timeService.notifyCallbacks()).not.toThrow();
            expect(errorCallback).toHaveBeenCalled();
            expect(goodCallback).toHaveBeenCalled();
        });
    });

    describe('real-time updates', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('starts and stops updates correctly', () => {
            expect(timeService.isRunning()).toBe(false);
            
            timeService.startUpdates();
            expect(timeService.isRunning()).toBe(true);
            
            timeService.stopUpdates();
            expect(timeService.isRunning()).toBe(false);
        });

        test('calls callbacks immediately when starting updates', () => {
            const mockCallback = jest.fn();
            timeService.onUpdate(mockCallback);
            
            timeService.startUpdates();
            
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        test('calls callbacks every second during updates', () => {
            const mockCallback = jest.fn();
            timeService.onUpdate(mockCallback);
            
            timeService.startUpdates();
            expect(mockCallback).toHaveBeenCalledTimes(1);
            
            jest.advanceTimersByTime(1000);
            expect(mockCallback).toHaveBeenCalledTimes(2);
            
            jest.advanceTimersByTime(2000);
            expect(mockCallback).toHaveBeenCalledTimes(4);
        });

        test('does not start multiple intervals', () => {
            timeService.startUpdates();
            const firstInterval = timeService.updateInterval;
            
            timeService.startUpdates(); // Try to start again
            
            expect(timeService.updateInterval).toBe(firstInterval);
        });

        test('stops calling callbacks after stopping updates', () => {
            const mockCallback = jest.fn();
            timeService.onUpdate(mockCallback);
            
            timeService.startUpdates();
            jest.advanceTimersByTime(1000);
            
            timeService.stopUpdates();
            mockCallback.mockClear();
            
            jest.advanceTimersByTime(2000);
            expect(mockCallback).not.toHaveBeenCalled();
        });
    });
});