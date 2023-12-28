/** @type {import('tailwindcss').Config} */
module.exports = {
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
      width: {
        50: "12.5rem",
        112.5: "28.125rem",
      },
      textColor: {
        "neutrals.400": "#8C8C8C",
        "neutrals.600": "#595959",
      },
      leading: {
        3.5: "0.875rem",
      },
      borderColor: {
        "neutrals.200": "#F0F0F0",
      },
    },
  },
  plugins: [],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
}
