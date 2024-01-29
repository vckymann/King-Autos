/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/*.html"],
  theme: {
    extend: {
      fontFamily: {
        poppins : ["Poppins",'sans-serif'],
      },
      colors: {
        primary: `f5f5f5`,
        hfn: '#1a237e',
        accent:'#d32f2f',
        links:'#1565c0',
      }
    },
  },
  plugins: [],
}

