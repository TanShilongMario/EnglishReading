/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'luxury-bg': '#F9F8F6',      // 暖米白
        'luxury-paper': '#EBE5DE',   // 浅褐灰
        'luxury-text': '#1A1A1A',    // 深炭黑
        'luxury-muted': '#6C6863',   // 暖灰
        'luxury-gold': '#E2B933',    // 金属金
      },
      fontFamily: {
        'serif-classic': ['"Playfair Display"', 'serif'],
        'serif-modern': ['Lora', 'serif'],
        'sans-modern': ['Inter', 'sans-serif'],
        'sans-elegant': ['Montserrat', 'sans-serif'],
        'serif': ['"Playfair Display"', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        'editorial': '0.25em',
        'button': '0.2em',
      },
      transitionDuration: {
        'cinematic': '1500ms',
      }
    },
  },
  plugins: [],
}
