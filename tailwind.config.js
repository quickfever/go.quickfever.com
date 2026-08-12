/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
          accent: '#00f2fe',
        },
        dark: {
          bg: '#0a0d14',
          card: '#121624',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: '#1a2035',
        }
      },
    },
  },
  plugins: [],
};
