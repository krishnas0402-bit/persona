/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#09090b",
        surface: "#111113",
        border: "#1c1c1f",
        muted: "#52525b",
        subtle: "#71717a",
        primary: "#b06aff",
        "primary-dark": "#7c3aed",
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
        extrabold: ["Inter_800ExtraBold"],
        black: ["Inter_900Black"],
      },
    },
  },
  plugins: [],
};
