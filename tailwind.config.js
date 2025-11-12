/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./js/**/*.js",
  ],
  theme: {
    extend: {
      animation: {
        'spin': 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
}

