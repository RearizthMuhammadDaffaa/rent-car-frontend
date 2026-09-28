/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {

    extend: {
      colors: {
        'primary': '#2563EB',
        'primary-dull': '#1F58D8',
        'light': '#F1F5F9',
        'borderColor': '#c4c7d2',
        "muted-foreground": "#64748b"
      },
    },
  },
  plugins: [],
}