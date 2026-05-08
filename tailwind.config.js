/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: "#1D9E75",
        night: "#060d14",
        "water-deep": "#0a1820",
        "water-mid": "#0d2035",
        "water-light": "#4a9aba",
        teal: "#1D9E75",
        moon: "#e8dfc0",
        paper: "#f5f0e8",
        muted: "#8a8070",
        amber: "#EF9F27"
      }
    }
  },
  plugins: []
};

