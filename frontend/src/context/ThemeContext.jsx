import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Force light mode permanently across the entire application
    document.documentElement.setAttribute('data-theme', 'light');
    try {
      localStorage.setItem('campusgig_theme', 'light');
    } catch (e) {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    // Dark mode disabled; locked to clean light mode
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
