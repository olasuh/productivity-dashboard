// Jest setup file for DOM testing and global configurations

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

// Make localStorage available globally in tests
global.localStorage = localStorageMock;

// Reset localStorage mock before each test
beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  localStorageMock.key.mockClear();
});

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Setup DOM helpers
global.createMockElement = (tag, attributes = {}) => {
  const element = document.createElement(tag);
  Object.keys(attributes).forEach(key => {
    element.setAttribute(key, attributes[key]);
  });
  return element;
};

// Mock Date.now for consistent testing
const mockDateNow = jest.fn(() => new Date('2024-01-15T10:30:00Z').getTime());
global.Date.now = mockDateNow;

// Reset Date.now mock before each test
beforeEach(() => {
  mockDateNow.mockClear();
});