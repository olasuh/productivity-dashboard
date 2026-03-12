/**
 * Greeting Display Component - Shows current time, date, and greeting
 * 
 * This component handles the display of current time, date, and personalized greeting
 * with support for custom names.
 */

class GreetingDisplay {
    constructor(containerElement, timeService, customName = '') {
        this.container = containerElement;
        this.timeService = timeService;
        this.customName = customName;
        this.isActive = false;
        
        // Get DOM elements
        this.timeElement = this.container.querySelector('#time-display');
        this.dateElement = this.container.querySelector('#date-display');
        this.greetingElement = this.container.querySelector('#greeting-message');
        
        // Bind the update method to maintain context
        this.updateDisplay = this.updateDisplay.bind(this);
    }

    /**
     * Set custom name for greeting
     * @param {string} name - Custom name to display
     */
    setCustomName(name) {
        this.customName = name || '';
        // Force update display with new name
        if (this.isActive) {
            this.forceUpdate();
        }
    }

    /**
     * Start the greeting display updates
     */
    start() {
        if (this.isActive) {
            return;
        }
        
        this.isActive = true;
        this.timeService.onUpdate(this.updateDisplay);
        
        if (!this.timeService.isRunning()) {
            this.timeService.startUpdates();
        }
    }

    /**
     * Stop the greeting display updates
     */
    stop() {
        if (!this.isActive) {
            return;
        }
        
        this.isActive = false;
        this.timeService.removeCallback(this.updateDisplay);
    }

    /**
     * Update the display with current time data
     * @param {Object} timeData - Time data from TimeService
     */
    updateDisplay(timeData) {
        if (!this.isActive) {
            return;
        }
        
        if (this.timeElement) {
            this.timeElement.textContent = timeData.time;
        }
        
        if (this.dateElement) {
            this.dateElement.textContent = timeData.date;
        }
        
        if (this.greetingElement) {
            let greeting = timeData.greeting;
            if (this.customName) {
                greeting += `, ${this.customName}`;
            }
            this.greetingElement.textContent = greeting;
        }
    }

    /**
     * Force an immediate display update
     */
    forceUpdate() {
        const timeData = this.timeService.getCurrentTimeData();
        this.updateDisplay(timeData);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GreetingDisplay;
}