'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { LanguageProvider } from '../contexts/LanguageContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
