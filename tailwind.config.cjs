/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{svelte,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        barlow: ['"Barlow"', "sans-serif"],
      },
      boxShadow: {
        "list-item": "0px 2px 12px rgba(0, 0, 0, 0.12)",
        modal: "0px 4px 20px rgba(0, 0, 0, 0.5)",
      },
      padding: {
        2.5: "0.625rem",
      },
      gap: {
        2.5: "0.625rem",
      },
      backgroundColor: {
        "neutrals.200": "#F0F0F0",
      },
      borderColor: {
        "neutrals.200": "#F0F0F0",
      },
    },
  },
  plugins: [],
  content: {
    enabled: process.env.NODE_ENV === "publish",
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
  },
}
