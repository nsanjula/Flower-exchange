/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1B4F5A',
        'accent': '#3A9BA8',
        'bg-light': '#F7F5F0',
        'card': '#FFFFFF',
        'success': '#4CAF7D',
        'warning': '#F5A623',
        'danger': '#E05A5A',
        'text-dark': '#1A2B2E',
      },
      backgroundColor: {
        'primary': '#1B4F5A',
        'accent': '#3A9BA8',
        'bg-light': '#F7F5F0',
        'card': '#FFFFFF',
        'success': '#4CAF7D',
        'warning': '#F5A623',
        'danger': '#E05A5A',
      },
      textColor: {
        'dark': '#1A2B2E',
      },
    },
  },
  plugins: [],
}
