export const themeTokens = {
  colors: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#04883b', // FreshMart Signature Deep Green
      600: '#037030',
      700: '#025825',
      800: '#02421c',
      900: '#012c12',
    },
    canvas: '#f4fcf0', // FreshMart Soft Mint Light Canvas Background
    surface: '#ffffff', // Clean White Cards and Sidebar
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    status: {
      activeBg: '#e6f7ec',
      activeText: '#04883b',
      processingBg: '#e0f2fe',
      processingText: '#0284c7',
      pendingBg: '#fef3c7',
      pendingText: '#d97706',
      criticalBg: '#fde8e8',
      criticalText: '#e11d48',
    },
  },
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
} as const;

export type ThemeMode = 'light' | 'dark';
