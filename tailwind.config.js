export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        steel: {
          900: "#18232F",
          800: "#1E2C3A",
          700: "#28394A",
        },
        azure: {
          600: "#3B6EA5",
          100: "#E3EBF3",
        },
        amber: {
          600: "#B9812E",
          100: "#F7ECD9",
        },
        emerald: {
          600: "#2F8F5B",
          100: "#E1F1E8",
        },
        crimson: {
          600: "#C0392B",
          100: "#F8E3E0",
        },
        gray: {
          50: "#F4F6F8",
          100: "#E9EDF1",
          200: "#DBE1E7",
          400: "#8A96A3",
          600: "#4A5563",
          800: "#232B35",
        },
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
        display: ["Manrope", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
