/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["../views/**/*.{ejs,html}"],
  theme: {
    extend: {
      fontFamily: {
        poppins : ["Poppins",'sans-serif'],
      },
      colors: {
        'primary': '#099e66',
        'secondary': 'black',
        'textblack': 'black',
        'textwhite': 'white',
      },
    },
  },
  plugins: [],
}

