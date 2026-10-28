import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F3A5F',
          hover: '#15263C',
          foreground: '#FFFFFF',
        },
        // shadcn/ui token names, mapped onto the Neethi palette above
        background: '#FFFFFF',
        foreground: '#1B2430',
        border: '#E2E7EF',
        input: '#E2E7EF',
        ring: '#A9C2E0',
        secondary: { DEFAULT: '#EAF1F8', foreground: '#1F3A5F' },
        accent: { DEFAULT: '#EAF1F8', foreground: '#1B2430' },
        destructive: { DEFAULT: '#B42318', foreground: '#FFFFFF' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#1B2430' },
        soft: '#EAF1F8',
        line: '#E2E7EF',
        ink: '#1B2430',
        muted: '#667085',
        bg: '#F3F5F9',
        surface: '#FFFFFF',
        success: {
          text: '#2F6B57',
          bg: '#E4F0EA',
          dark: '#245C48',
          border: '#C4E0D2',
        },
        warn: {
          text: '#8A6A2E',
          bg: '#FBF6EC',
          border: '#F0E4CE',
        },
        focus: '#A9C2E0',
        faint: '#98A2B3',
        body2: '#4B5563',
        body3: '#374151',
        scrollbar: '#D5DCE6',
      },
      fontFamily: {
        heading: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['Figtree', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px rgba(120,90,50,0.10)',
        login: '0 12px 40px rgba(120,90,50,0.08)',
      },
      keyframes: {
        dotpulse: {
          '0%, 80%, 100%': { opacity: '0.25', transform: 'translateY(0)' },
          '40%': { opacity: '1', transform: 'translateY(-3px)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        dotpulse: 'dotpulse 1s infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        spin: 'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [animate],
}
