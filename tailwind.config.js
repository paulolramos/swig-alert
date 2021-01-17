module.exports = {
  purge: ['./views/*.hbs', './views/**/*.hbs', './views/**/**/*.hbs'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto'],
        logo: ['Megrim'],
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['checked'],
      textColor: ['checked'],
      borderColor: ['checked'],
      opacity: ['disabled'],
    },
  },
  plugins: [],
};
