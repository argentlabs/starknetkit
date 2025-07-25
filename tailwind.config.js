import {
  tailwindThemeColors,
  tailwindThemeFontSizeWeb,
} from "@argent/x-ui/tailwind"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./node_modules/@argent/x-ui/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary-orange-400": "var(--color-primary-orange-400)",
        "surface-default": "var(--color-surface-default)",
        ...tailwindThemeColors,
      },
      fontSize: {
        ...tailwindThemeFontSizeWeb,
      },
      boxShadow: {
        "list-item": "0px 4px 12px 0px rgba(0, 0, 0, 0.06)",
        modal: "0px 4px 20px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
}
