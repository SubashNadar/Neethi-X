import animate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sage & Clay theme: warm paper, deep jade for actions, soft clay (apricot) for attention.
        // Scales follow Radix Colors (MIT, https://github.com/radix-ui/colors): sage, jade, amber.
        primary: {
          DEFAULT: '#1E6B5C',
          hover: '#175648',
          foreground: '#FFFFFF',
          edge: '#0F4237',
          tint: '#E3F1EC',
        },
        // shadcn/ui token names, mapped onto the Sage & Clay palette
        background: '#F6F4EE',
        foreground: '#1C2321',
        border: '#E3DFD5',
        input: '#D5D0C4',
        ring: '#1E6B5C',
        secondary: { DEFAULT: '#EEEBE3', foreground: '#1C2321' },
        accent: { DEFAULT: '#EEEBE3', foreground: '#1C2321' },
        destructive: { DEFAULT: '#D64545', foreground: '#FFFFFF' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#1C2321' },
        // Deep jade, kept under the old "navy" name for the few dark hero panels.
        navy: {
          950: '#0F2E28',
          900: '#133A33',
          800: '#1A4A41',
          700: '#22594E',
          600: '#2E6E60',
        },
        // Clay, kept under the old "brass" name: the attention colour for labels, citations and highlights.
        brass: {
          DEFAULT: '#E0894A',
          light: '#A4551F',
          soft: '#FCEFE3',
          dark: '#8A4518',
          glow: '#F2B184',
        },
        soft: '#EEEBE3',
        line: '#E3DFD5',
        ink: '#1C2321',
        muted: '#5E6763',
        bg: '#F6F4EE',
        surface: '#FFFFFF',
        success: {
          text: '#1F7A55',
          bg: '#E7F5EE',
          dark: '#2E9A6C',
          border: '#BFE3D0',
        },
        warn: {
          text: '#8A5A00',
          bg: '#FFF6DF',
          border: '#F0D9A0',
        },
        focus: '#1E6B5C',
        faint: '#6F7773',
        body2: '#46504C',
        body3: '#2B3330',
        scrollbar: '#D5D0C4',
      },
      fontFamily: {
        heading: ['Fraunces', 'Georgia', 'serif'],
        body: ['Figtree', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: '0 8px 24px rgba(28,35,33,0.08)',
        login: '0 12px 40px rgba(28,35,33,0.12)',
        card: '0 1px 2px rgba(28,35,33,0.05), 0 4px 16px rgba(28,35,33,0.06)',
        lift: '0 2px 4px rgba(28,35,33,0.06), 0 16px 40px rgba(28,35,33,0.12)',
        composer: '0 10px 34px rgba(30,107,92,0.16)',
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
        ping2: {
          '0%': { transform: 'scale(1)', opacity: '0.55' },
          '100%': { transform: 'scale(1.9)', opacity: '0' },
        },
      },
      animation: {
        dotpulse: 'dotpulse 1s infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        spin: 'spin 0.8s linear infinite',
        ping2: 'ping2 1.8s cubic-bezier(0,0,.2,1) infinite',
      },
    },
  },
  plugins: [animate],
}
