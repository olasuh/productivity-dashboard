/**
 * Unit Tests for Greeting Display Component
 * Tests the basic functionality implemented for Task 2.1 demonstration
 */

// Import required classes
const TimeService = require('../../js/time-service.js');
const GreetingDisplay = require('../../js/greeting-display.js');

// Mock DOM elements
const createMockContainer = () => {
    return {
        querySelector: jest.fn((selector) => {
            const mockElement = {
                textContent: ''
            };
            return mockElement;
        })
    };
};

describe('GreetingDisplay', () => {
    let timeService;
    let container;
    let greetingDisplay;
    let mockTimeElement;
    let mockDateElement;
    let mockGreetingElement;

    beforeEach(() => {
        timeService = new TimeService();
        container = createMockContainer();
        
        // Create mock elements
        mockTimeElement = { textContent: '' };
        mockDateElement = { textContent: '' };
        mockGreetingElement = { textContent: '' };
        
        // Set up querySelector to return appropriate elements
        container.querySelector.mockImplementation((selector) => {
            switch (selector) {
                case '#time-display':
                    return mockTimeElement;
                case '#date-display':
                    return mockDateElement;
                case '#greeting-message':
                    return mockGreetingElement;
                default:
                    return null;
            }
        });
        
        greetingDisplay = new GreetingDisplay(container, timeService);
    });

    afterEach(() => {
        greetingDisplay.stop();
        timeService.stopUpdates();
    });

    describe('initialization', () => {
        test('creates greeting display with container and time service', () => {
            expect(greetingDisplay.container).toBe(container);
            expect(greetingDisplay.timeService).toBe(timeService);
            expect(greetingDisplay.isActive).toBe(false);
        });

        test('finds DOM elements on initialization', () => {
            expect(container.querySelector).toHaveBeenCalledWith('#time-display');
            expect(container.querySelector).toHaveBeenCalledWith('#date-display');
            expect(container.querySelector).toHaveBeenCalledWith('#greeting-message');
        });
    });

    describe('start and stop', () => {
        test('starts updates and registers callback', () => {
            const onUpdateSpy = jest.spyOn(timeService, 'onUpdate');
            
            greetingDisplay.start();
            
            expect(greetingDisplay.isActive).toBe(true);
            expect(onUpdateSpy).toHaveBeenCalledWith(greetingDisplay.updateDisplay);
        });

        test('stops updates and removes callback', () => {
            const removeCallbackSpy = jest.spyOn(timeService, 'removeCallback');
            
            greetingDisplay.start();
            greetingDisplay.stop();
            
            expect(greetingDisplay.isActive).toBe(false);
            expect(removeCallbackSpy).toHaveBeenCalledWith(greetingDisplay.updateDisplay);
        });

        test('does not start multiple times', () => {
            const onUpdateSpy = jest.spyOn(timeService, 'onUpdate');
            
            greetingDisplay.start();
            greetingDisplay.start();
            
            expect(onUpdateSpy).toHaveBeenCalledTimes(1);
        });

        test('does not stop when not active', () => {
            const removeCallbackSpy = jest.spyOn(timeService, 'removeCallback');
            
            greetingDisplay.stop();
            
            expect(removeCallbackSpy).not.toHaveBeenCalled();
        });
    });

    describe('updateDisplay', () => {
        test('updates all display elements with time data', () => {
            const timeData = {
                time: '14:30:45',
                date: 'Monday, January 15, 2024',
                greeting: 'Good Afternoon'
            };
            
            greetingDisplay.start();
            greetingDisplay.updateDisplay(timeData);
            
            expect(mockTimeElement.textContent).toBe('14:30:45');
            expect(mockDateElement.textContent).toBe('Monday, January 15, 2024');
            expect(mockGreetingElement.textContent).toBe('Good Afternoon');
        });

        test('does not update when not active', () => {
            const timeData = {
                time: '14:30:45',
                date: 'Monday, January 15, 2024',
                greeting: 'Good Afternoon'
            };
            
            greetingDisplay.updateDisplay(timeData);
            
            expect(mockTimeElement.textContent).toBe('');
            expect(mockDateElement.textContent).toBe('');
            expect(mockGreetingElement.textContent).toBe('');
        });

        test('handles missing DOM elements gracefully', () => {
            container.querySelector.mockReturnValue(null);
            greetingDisplay = new GreetingDisplay(container, timeService);
            
            const timeData = {
                time: '14:30:45',
                date: 'Monday, January 15, 2024',
                greeting: 'Good Afternoon'
            };
            
            greetingDisplay.start();
            
            expect(() => greetingDisplay.updateDisplay(timeData)).not.toThrow();
        });
    });

    describe('forceUpdate', () => {
        test('gets current time data and updates display', () => {
            const getCurrentTimeDataSpy = jest.spyOn(timeService, 'getCurrentTimeData');
            const updateDisplaySpy = jest.spyOn(greetingDisplay, 'updateDisplay');
            
            greetingDisplay.forceUpdate();
            
            expect(getCurrentTimeDataSpy).toHaveBeenCalled();
            expect(updateDisplaySpy).toHaveBeenCalled();
        });
    });
});