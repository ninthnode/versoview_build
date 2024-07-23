 /** @type {Config} */ 
/** @typedef {import('tailwindcss').Config} Config */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
	// Or if using `src` directory:
	"./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  mode: 'jit',
  // These paths are just examples, customize them to match your project structure

  theme: {
    extend: {},
  },
  plugins: [],
}

