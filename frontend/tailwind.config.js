/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2B628B', // Azul oscuro para el fondo
        secondary: '#D00003', // Rojo para botones y mensajes de error
        accent: '#1F2937', // Gris oscuro para anillos de foco y botones secundarios
      },
    },
  },
  plugins: [],
};