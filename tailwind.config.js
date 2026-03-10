
/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        // AutoVital brand – primary SaaS red
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#E31B23', // Primary brand color
          600: '#C8102E', // Primary hover / pressed
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
          950: '#240404',
        },
        // Secondary charts / accents – blue
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3B82F6', // Secondary charts color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Layout neutrals
        dark: '#111827',
        surface: {
          50: '#F5F5F5', // Dashboard background
          100: '#f3f4f6',
          200: '#e5e7eb', // Card border
          300: '#d1d5db', // Form borders
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2933',
          900: '#111827',
        }
      },
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 40px -5px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(18, 115, 234, 0.4)',
        'glow-accent': '0 0 20px rgba(57, 211, 83, 0.4)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #1273EA33 0deg, #39D35333 180deg, #1273EA33 360deg)',
      }
    },
  },
  plugins: [],
}
