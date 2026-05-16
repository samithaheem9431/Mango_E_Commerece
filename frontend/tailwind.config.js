/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./context/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          forest: "#14532d",
          leaf: "#15803d",
          sprout: "#16a34a",
          mint: "#dcfce7",
          mist: "#f0fdf4",
          sun: "#FDE047",
          gold: "#facc15",
          harvest: "#fefce8",
          wheat: "#fef9c3",
          bark: "#1a2e05",
          soil: "#365314"
        },
        luxury: {
          gold: "#D4AF37",
          "gold-light": "#F9E498",
          "gold-dark": "#996515",
          black: "#0A0A0A",
          charcoal: "#1A1A1A",
        }
      },
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["DM Sans", "sans-serif"]
      },
      backgroundImage: {
        orchard: "url('/images/orchard-pattern.svg')",
        "gold-gradient": "linear-gradient(to right, #996515, #D4AF37, #F9E498, #D4AF37, #996515)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(10px, 10px)" },
        },
        glow: {
          "0%, 100%": { opacity: 0.3 },
          "50%": { opacity: 0.6 },
        }
      },
      animation: {
        drift: "drift 8s ease-in-out infinite",
        glow: "glow 4s ease-in-out infinite",
      }
    }
  },
  plugins: []
};
