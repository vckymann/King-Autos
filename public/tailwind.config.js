/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["../views/*.ejs"],
  theme: {
    extend: {
      fontFamily: {
        poppins : ["Poppins",'sans-serif'],
      },
      colors: {
        'primary': '#ffd71b',
        'secondary': 'black',
        'textblack': 'black',
        'textwhite': 'white',
      },
    },
  },
  plugins: [],
}

