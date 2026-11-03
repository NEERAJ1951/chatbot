/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Futuristic Dark Theme Design Tokens
        cosmos: {
          DEFAULT: '#080B12',
          light: '#101725',
          card: '#0A0F1A',
        },
        accent: {
          DEFAULT: '#60A5FA',
          hover: '#3B82F6',
          glow: '#38BDF8',
          soft: 'rgba(96, 165, 250, 0.1)',
          border: 'rgba(96, 165, 250, 0.2)',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          hover: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(148, 163, 184, 0.1)',
          strong: 'rgba(255, 255, 255, 0.12)',
        },
        // Preserve existing tokens for non-chat pages
        ivory: '#F8F7F3',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#18212B',
          light: '#2E3D4F',
          dark: '#0F161E',
        },
        navy: {
          DEFAULT: '#172D4A',
          hover: '#13243C',
          dark: '#0D1A2D',
          light: '#234168',
          subtle: '#EEF3F8',
        },
        saffron: {
          DEFAULT: '#C58A32',
          hover: '#B07826',
          subtle: '#FAF4EB',
          border: '#E8D2AF',
        },
        warm: {
          border: '#E7E4DC',
          hover: '#EFECE5',
          subtle: '#F4F2EB',
        },
        sage: {
          DEFAULT: '#36765B',
          subtle: '#EDF5F1',
          border: '#BFE0D2',
        },
        ruby: {
          DEFAULT: '#B42318',
          subtle: '#FDF2F2',
          border: '#FECDCA',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'modal': '0 8px 30px rgba(0, 0, 0, 0.5)',
        'glow': '0 0 20px rgba(96, 165, 250, 0.15)',
        'glow-lg': '0 0 40px rgba(96, 165, 250, 0.2)',
      },
      maxWidth: {
        'reading': '48rem',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'drift': 'drift 20s linear infinite',
        'blink': 'blink 1s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        drift: {
          '0%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
          '100%': { transform: 'translateY(0) translateX(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
