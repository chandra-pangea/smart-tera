/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Role accent colors, referenced across badges and panels.
        admin: '#7c3aed',
        editor: '#2563eb',
        operator: '#0d9488',
      },
    },
  },
  plugins: [],
}
