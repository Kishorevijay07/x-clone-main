import daisyui from 'daisyui'
import daisyuiThemes from "daisyui/src/theming/themes"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],

  daisyui: {
    themes: [
      "light",
      {
        black: {
          ...daisyuiThemes["black"], // Correct reference to the black theme
          primary: "rgb(29,155,240)",
          secondary: "rgb(24,24,24)",
        },
      },
    ],
  },
};
