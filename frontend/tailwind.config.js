/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "white",
        foreground: "black",
        primary: {
          DEFAULT: "#ef4444", // red-500
          foreground: "white",
        },
        muted: {
          DEFAULT: "#f3f4f6", // gray-100
          foreground: "#6b7280", // gray-500
        },
        border: "#e5e7eb", // gray-200
        card: {
          DEFAULT: "white",
          foreground: "black",
        }
      },
    },
  },
  plugins: [],
}
