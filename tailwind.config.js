/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5E5CE6",
        secondary: "#FFBD59",
        zinc: {
          850: "#1e1e20",
          950: "#09090b",
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'fade-in':        'fadeIn 0.3s ease both',
        'fade-in-up':     'fadeInUp 0.4s ease both',
        'fade-in-down':   'fadeInDown 0.35s ease both',
        'slide-in-right': 'slideInRight 0.35s ease both',
        'slide-in-left':  'slideInLeft 0.35s ease both',
        'scale-in':       'scaleIn 0.3s ease both',
        'scale-in-modal': 'scaleInModal 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
        'float':          'float 3s ease-in-out infinite',
        'pulse-slow':     'pulse-slow 2s ease-in-out infinite',
        'spin-slow':      'spin-slow 3s linear infinite',
        'bounce-in':      'bounceIn 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both',
        'toast-slide':    'toastSlide 0.35s ease both',
        'tab-content':    'slideTabContent 0.3s ease both',
        'gradient':       'gradientShift 4s ease infinite',
        'glow':           'glow 2s ease-in-out infinite',
        'count-up':       'countUp 0.5s ease both',
      },
      keyframes: {
        fadeIn:         { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeInUp:       { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeInDown:     { from: { opacity: '0', transform: 'translateY(-18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight:   { from: { opacity: '0', transform: 'translateX(24px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideInLeft:    { from: { opacity: '0', transform: 'translateX(-24px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:        { from: { opacity: '0', transform: 'scale(0.94)' }, to: { opacity: '1', transform: 'scale(1)' } },
        scaleInModal:   { from: { opacity: '0', transform: 'scale(0.9) translateY(10px)' }, to: { opacity: '1', transform: 'scale(1) translateY(0)' } },
        float:          { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        'pulse-slow':   { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        'spin-slow':    { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        gradientShift:  { '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
        countUp:        { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        bounceIn:       { '0%': { transform: 'scale(0.3)', opacity: '0' }, '50%': { transform: 'scale(1.05)' }, '70%': { transform: 'scale(0.9)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        toastSlide:     { from: { transform: 'translateX(100%)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        slideTabContent:{ from: { opacity: '0', transform: 'translateX(12px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        glow:           { '0%, 100%': { boxShadow: '0 0 8px rgba(94, 92, 230, 0.3)' }, '50%': { boxShadow: '0 0 20px rgba(94, 92, 230, 0.6)' } },
      },
    },
  },
  plugins: [],
}
