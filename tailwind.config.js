/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./.storybook/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderWidth: {
        3: "2px",
        4: "4px",
      },
      borderRadius: {
        "bb-lg": "1.125rem",
        "bb-xl": "1.5rem",
      },
      boxShadow: {
        "bb-neo":
          "6px 6px 0 rgba(15, 23, 42, 0.14), 0 14px 28px rgba(15, 23, 42, 0.06)",
        "bb-neo-sm":
          "4px 4px 0 rgba(15, 23, 42, 0.14), 0 10px 20px rgba(15, 23, 42, 0.06)",
        "bb-press":
          "2px 2px 0 rgba(15, 23, 42, 0.10), 0 6px 12px rgba(15, 23, 42, 0.05)",
      },
      colors: {
        bb: {
          bg: "#FBF8F2",
          surface: "#FFFFFF",
          ink: "#0F172A",
          muted: "#475569",
          line: "rgba(15, 23, 42, 0.14)",

          primary: "#22C55E",
          primaryHover: "#16A34A",

          secondary: "#E6F4FF",
          secondaryHover: "#D8EEFF",

          success: "#16A34A",
          warning: "#F59E0B",
          danger: "#E11D48",
        },
      },
      fontFamily: {
        sans: [
          '"Nunito Sans"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "Apple Color Emoji",
          "Segoe UI Emoji",
        ],
        display: [
          '"Varela Round"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
        ],
      },
    },
  },
  plugins: [],
};
