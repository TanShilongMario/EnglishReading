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
        // 使用跨平台兼容的系统原生字体
        'serif-classic': ['Georgia', '"STSong"', '"Songti SC"', '"SimSun"', 'serif'],
        'serif-modern': ['"Times New Roman"', 'Times', '"STZhongsong"', '"SimSun"', 'serif'],
        'sans-modern': ['Inter', '-apple-system', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        'sans-elegant': ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        // 默认字体
        'serif': ['Georgia', '"STSong"', '"Songti SC"', '"SimSun"', 'serif'],
        'sans': ['Inter', '-apple-system', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      fontSize: {
        // 补充极小字号，替代 text-[9px]、text-[10px]
        'xxs': ['0.625rem', { lineHeight: '1rem' }],     // 10px
        'xxs2': ['0.5625rem', { lineHeight: '0.75rem' }], // 9px
      },
      letterSpacing: {
        'editorial': '0.25em',
        'button': '0.2em',
        'widest-plus': '0.5em',
      },
      transitionDuration: {
        'cinematic': '1500ms',
      }
    },
  },
  plugins: [],
}
