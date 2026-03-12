/**
 * Unit Tests for Timer Service
 * Tests specific examples and edge cases for timer countdown functionality
 */

// Import TimerService for testing
const TimerService = require('../../js/timer-service.js');

describe('TimerService', () => {
    let timerService;

    beforeEach(() => {
        timerService = new TimerService();
        jest.useFakeTimers();
    });

    afterEach(() => {
        timerService.stop();
        jest.useRealTimers();
    });

    describe('initialization', () => {
        test('initializes with 25-minute countdown (25:00)', () => {
            expect(timerService.getRemainingTime()).toBe(25 * 60 * 1000);
            expect(timerService.getFormattedTime()).toBe('25:00');
            expect(timerService.getIsRunning()).toBe(false);
            expect(timerService.isCompleted()).toBe(false);
        });

        test('getState returns correct initial state', () => {
            const state = timerService.getState();
            expect(state).toEqual({
                remainingTime: 25 * 60 * 1000,
                isRunning: false,
                startTime: null,
                totalDuration: 25 * 60 * 1000,
                formattedTime: '25:00'
            });
        });
    });

    describe('formatTime', () => {
        test('formats 25 minutes correctly', () => {
            expect(timerService.formatTime(25 * 60 * 1000)).toBe('25:00');
        });

        test('formats 1 minute correctly', () => {
            expect(timerService.formatTime(60 * 1000)).toBe('01:00');
        });

        test('formats 30 seconds correctly', () => {
            expect(timerService.formatTime(30 * 1000)).toBe('00:30');
        });

        test('formats 0 seconds correctly', () => {
            expect(timerService.formatTime(0)).toBe('00:00');
        });

        test('formats partial seconds by rounding up', () => {
            expect(timerService.formatTime(500)).toBe('00:01'); // 0.5 seconds rounds up to 1
            expect(timerService.formatTime(1500)).toBe('00:02'); // 1.5 seconds rounds up to 2
        });

        test('uses current remaining time when no parameter provided', () => {
            timerService.remainingTime = 10 * 60 * 1000; // 10 minutes
            expect(timerService.formatTime()).toBe('10:00');
        });
    });

    describe('start functionality', () => {
        test('starts timer correctly', () => {
            const mockCallback = jest.fn();
            timerService.onUpdate(mockCallback);

            timerService.start();

            expect(timerService.getIsRunning()).toBe(true);
            expect(timerService.getState().startTime).not.toBeNull();
            expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
                isRunning: true,
                startTime: expect.any(Number)
            }));
        });

        test('does not start if already running', () => {
            timerService.start();
            const firstStartTime = timerService.getState().startTime;
            
            // Try to start again
            timerService.start();
            
            expect(timerService.getState().startTime).toBe(firstStartTime);
        });

        test('does not start if timer is completed', () => {
            timerService.remainingTime = 0;
            
            timerService.start();
            
            expect(timerService.getIsRunning()).toBe(false);
        });
    });

    describe('stop functionality', () => {
        test('stops timer correctly', () => {
            const mockCallback = jest.fn();
            timerService.onUpdate(mockCallback);

            timerService.start();
            mockCallback.mockClear();
            
            timerService.stop();

            expect(timerService.getIsRunning()).toBe(false);
            expect(timerService.getState().startTime).toBeNull();
            expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
                isRunning: false,
                startTime: null
            }));
        });

        test('does nothing if already stopped', () => {
            const mockCallback = jest.fn();
            timerService.onUpdate(mockCallback);

            timerService.stop(); // Stop when already stopped

            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('maintains remaining time when paused', () => {
            timerService.start();
            
            // Simulate 5 seconds passing
            jest.advanceTimersByTime(5000);
            
            const remainingBeforeStop = timerService.getRemainingTime();
            timerService.stop();
            
            // Time should be preserved
            expect(timerService.getRemainingTime()).toBe(remainingBeforeStop);
        });
    });

    describe('reset functionality', () => {
        test('resets to 25:00 from any state', () => {
            // Start and let some time pass
            timerService.start();
            jest.advanceTimersByTime(5000);
            
            timerService.reset();
            
            expect(timerService.getRemainingTime()).toBe(25 * 60 * 1000);
            expect(timerService.getFormattedTime()).toBe('25:00');
            expect(timerService.getIsRunning()).toBe(false);
            expect(timerService.getState().startTime).toBeNull();
        });

        test('resets from completed state', () => {
            timerService.remainingTime = 0;
            
            timerService.reset();
            
            expect(timerService.getRemainingTime()).toBe(25 * 60 * 1000);
            expect(timerService.getFormattedTime()).toBe('25:00');
            expect(timerService.isCompleted()).toBe(false);
        });

        test('notifies callbacks on reset', () => {
            const mockCallback = jest.fn();
            timerService.onUpdate(mockCallback);

            timerService.reset();

            expect(mockCallback).toHaveBeenCalledWith(expect.objectContaining({
                remainingTime: 25 * 60 * 1000,
                isRunning: false,
                formattedTime: '25:00'
            }));
        });
    });

    describe('countdown behavior', () => {
        test('counts down correctly over time', () => {
            timerService.start();
            
            // Advance by 1 second
            jest.advanceTimersByTime(1000);
            expect(timerService.getRemainingTime()).toBeLessThan(25 * 60 * 1000);
            expect(timerService.getRemainingTime()).toBeGreaterThan(24 * 60 * 1000);
            
            // Advance by 1 minute total
            jest.advanceTimersByTime(59000);
            expect(timerService.getRemainingTime()).toBeLessThan(24 * 60 * 1000 + 1000);
            expect(timerService.getRemainingTime()).toBeGreaterThan(24 * 60 * 1000 - 1000);
        });

        test('updates display every 100ms', () => {
            const mockCallback = jest.fn();
            timerService.onUpdate(mockCallback);
            
            timerService.start();
            mockCallback.mockClear();
            
            // Should update every 100ms
            jest.advanceTimersByTime(100);
            expect(mockCallback).toHaveBeenCalledTimes(1);
            
            jest.advanceTimersByTime(100);
            expect(mockCallback).toHaveBeenCalledTimes(2);
        });
    });

    describe('completion detection', () => {
        test('detects completion when reaching 00:00', () => {
            const mockCompletionCallback = jest.fn();
            timerService.onComplete(mockCompletionCallback);
            
            // Set timer to 1 second remaining
            timerService.remainingTime = 1000;
            timerService.start();
            
            // Advance past completion
            jest.advanceTimersByTime(1100);
            
            expect(timerService.isCompleted()).toBe(true);
            expect(timerService.getRemainingTime()).toBe(0);
            expect(timerService.getFormattedTime()).toBe('00:00');
            expect(timerService.getIsRunning()).toBe(false);
            expect(mockCompletionCallback).toHaveBeenCalledTimes(1);
        });

        test('stops timer automatically on completion', () => {
            timerService.remainingTime = 500; // 0.5 seconds
            timerService.start();
            
            jest.advanceTimersByTime(600);
            
            expect(timerService.getIsRunning()).toBe(false);
        });
    });

    describe('callback management', () => {
        test('can register and remove update callbacks', () => {
            const mockCallback = jest.fn();
            
            timerService.onUpdate(mockCallback);
            timerService.reset(); // Trigger callback
            expect(mockCallback).toHaveBeenCalledTimes(1);
            
            timerService.removeUpdateCallback(mockCallback);
            timerService.reset(); // Should not trigger callback
            expect(mockCallback).toHaveBeenCalledTimes(1);
        });

        test('can register and remove completion callbacks', () => {
            const mockCallback = jest.fn();
            
            timerService.onComplete(mockCallback);
            timerService.removeCompletionCallback(mockCallback);
            
            // Trigger completion
            timerService.remainingTime = 100;
            timerService.start();
            jest.advanceTimersByTime(200);
            
            expect(mockCallback).not.toHaveBeenCalled();
        });

        test('ignores non-function callbacks', () => {
            expect(() => {
                timerService.onUpdate('not a function');
                timerService.onComplete(null);
            }).not.toThrow();
        });

        test('handles callback errors gracefully', () => {
            const errorCallback = jest.fn(() => {
                throw new Error('Test error');
            });
            const goodCallback = jest.fn();
            
            timerService.onUpdate(errorCallback);
            timerService.onUpdate(goodCallback);
            
            expect(() => timerService.reset()).not.toThrow();
            expect(errorCallback).toHaveBeenCalled();
            expect(goodCallback).toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        test('handles very small time values correctly', () => {
            timerService.remainingTime = 1; // 1 millisecond
            expect(timerService.formatTime()).toBe('00:01'); // Should round up
        });

        test('handles zero time correctly', () => {
            timerService.remainingTime = 0;
            expect(timerService.formatTime()).toBe('00:00');
            expect(timerService.isCompleted()).toBe(true);
        });

        test('prevents negative time values', () => {
            timerService.remainingTime = 100;
            timerService.start();
            
            // Advance way past completion
            jest.advanceTimersByTime(5000);
            
            expect(timerService.getRemainingTime()).toBe(0);
            expect(timerService.getRemainingTime()).not.toBeLessThan(0);
        });
    });
});