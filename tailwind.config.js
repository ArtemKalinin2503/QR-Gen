/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "rgb(var(--color-brand-500) / <alpha-value>)",
          400: "rgb(var(--color-brand-400) / <alpha-value>)",
        },
        background: {
          body: "rgb(var(--color-bg-body) / <alpha-value>)",
        },
        base: {
          black: "rgb(var(--color-black) / <alpha-value>)",
          white: "rgb(var(--color-white) / <alpha-value>)",
        },
        success: {
          600: "rgb(var(--color-success-600) / <alpha-value>)",
        },
        danger: {
          600: "rgb(var(--color-danger-600) / <alpha-value>)",
        },
      },
      borderRadius: {
        ui: "8px",
      },
      fontSize: {
        section: ["14px", { lineHeight: "20px" }],
        subsection: ["13px", { lineHeight: "18px" }],
        label: ["16px", { lineHeight: "22px" }],
        hint: ["14px", { lineHeight: "20px" }],
        button: ["14px", { lineHeight: "20px" }],
      },
      boxShadow: {
        card: "0 4px 10px rgba(0, 69, 148, 0.05)",
      },
    },
  },
  plugins: [],
}
