# Productivity Dashboard

A client-side productivity dashboard built with vanilla HTML, CSS, and JavaScript. Features a focus timer, task manager, quick links, and personalized greeting display with local data persistence.

## Features

- **Greeting Display**: Shows current time, date, and time-appropriate greeting
- **Focus Timer**: 25-minute Pomodoro timer with start/stop/reset controls
- **Task Manager**: Create, edit, complete, and delete tasks with local persistence
- **Quick Links**: Manage favorite website shortcuts with easy access
- **Local Storage**: All data persists locally in the browser

## Project Structure

```
productivity-dashboard/
├── index.html              # Main HTML file with semantic structure
├── css/
│   └── styles.css         # CSS with purple gradient theme and responsive design
├── js/
│   └── app.js            # Main JavaScript application entry point
├── tests/
│   ├── setup.js          # Jest configuration and test utilities
│   ├── unit/             # Unit tests for components and services
│   ├── property/         # Property-based tests using fast-check
│   └── integration/      # Integration and end-to-end tests
├── package.json          # Dependencies and scripts
└── README.md            # Project documentation
```

## Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Tests**:
   ```bash
   npm test                # Run all tests
   npm run test:watch      # Run tests in watch mode
   npm run test:coverage   # Run tests with coverage report
   ```

3. **Development Server**:
   ```bash
   npm run dev            # Start live-server on port 3000
   ```

## Testing Strategy

The project uses a dual testing approach:

- **Unit Tests**: Test specific examples, edge cases, and component integration
- **Property Tests**: Verify universal properties across all inputs using fast-check

### Testing Framework

- **Jest**: Test runner with jsdom environment for DOM testing
- **fast-check**: Property-based testing library for comprehensive input validation
- **Coverage**: Tracks test coverage across all JavaScript modules

## Architecture

The application follows a modular component architecture:

### Components
- **GreetingDisplay**: Time, date, and greeting management
- **FocusTimer**: Pomodoro timer functionality
- **TaskManager**: CRUD operations for tasks
- **QuickLinks**: Website shortcut management

### Services
- **TimeService**: Date/time operations and formatting
- **TimerService**: Countdown and timer state management
- **StorageService**: Local Storage operations with error handling

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

## Implementation Status

- [x] Project structure and development environment
- [ ] Core service layer implementation
- [ ] Component development
- [ ] UI styling and responsive design
- [ ] Integration and performance optimization

## License

MIT License