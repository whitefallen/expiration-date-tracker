import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeContextProvider, useThemeContext } from '../contexts/ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses the theme context
function TestComponent() {
  const { mode, toggleTheme } = useThemeContext();
  return (
    <div>
      <div data-testid="theme-mode">{mode}</div>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should render with light mode by default', () => {
    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('should toggle theme from light to dark', () => {
    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');
    const themeMode = screen.getByTestId('theme-mode');

    expect(themeMode).toHaveTextContent('light');

    fireEvent.click(toggleButton);

    expect(themeMode).toHaveTextContent('dark');
  });

  it('should toggle theme from dark to light', () => {
    localStorageMock.setItem('themeMode', 'dark');

    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');
    const themeMode = screen.getByTestId('theme-mode');

    expect(themeMode).toHaveTextContent('dark');

    fireEvent.click(toggleButton);

    expect(themeMode).toHaveTextContent('light');
  });

  it('should persist theme preference to localStorage', () => {
    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );

    const toggleButton = screen.getByTestId('toggle-button');

    fireEvent.click(toggleButton);

    expect(localStorageMock.getItem('themeMode')).toBe('dark');
  });

  it('should load theme preference from localStorage', () => {
    localStorageMock.setItem('themeMode', 'dark');

    render(
      <ThemeContextProvider>
        <TestComponent />
      </ThemeContextProvider>
    );

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
  });

  it('should throw error when useThemeContext is used outside provider', () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useThemeContext must be used within ThemeContextProvider'
    );

    consoleErrorSpy.mockRestore();
  });
});
