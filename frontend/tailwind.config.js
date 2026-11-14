/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta PÉTALO & AROMA
        "forest-green": {
          50: "#E8F0EC",
          100: "#C5D9CB",
          200: "#9FB897",
          300: "#789763",
          400: "#5A7A4A",
          500: "#2F4F4F", // verde bosque principal
          600: "#263D3D",
          700: "#1D2B2B",
          800: "#141E1E",
          900: "#0B1414",
        },
        "sage-green": {
          50: "#F3F5EF",
          100: "#E0E6D6",
          200: "#C2C9AD",
          300: "#A3AB84",
          400: "#8F9779", // verde salvia principal
          500: "#727A5E",
          600: "#575D48",
          700: "#3C3F35",
          800: "#262822",
          900: "#131411",
        },
        beige: {
          50: "#FFFDF9",
          100: "#FFFAF0", // blanco cálido
          200: "#F5F5DC",
          300: "#EAE3D2",
          400: "#DDD0B8",
          500: "#C9BFA3",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
}