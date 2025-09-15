import { ThemeContext } from '@/hooks/themeHook';
import React, { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
export type ThemeContextType = {
    theme: Theme | null;
    toggleTheme: () => void;
};


export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme | null>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const defaultTheme = savedTheme || (prefersDark ? 'dark' : 'light');

        setTheme(defaultTheme);
    }, []);

    useEffect(() => {
        if (theme) {
            const root = document.documentElement;
            root.classList.remove(theme === 'dark' ? 'light' : 'dark');
            root.classList.add(theme);
            localStorage.setItem('theme', theme);
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

