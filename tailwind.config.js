/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      aspectRatio: {
        video: '16 / 9',
      },
    },
  },
  plugins: [],
  corePlugins: {
    aspectRatio: false, // Disable if you're using the @tailwindcss/aspect-ratio plugin
  }
}