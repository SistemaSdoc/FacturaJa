/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}", // adicione se usa src/
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        accent: "var(--accent)",
        background: "var(--background)",
        // 'foreground' não existe no seu CSS; mapear para card-foreground/text-on-light
        foreground: "var(--card-foreground)", 
        surface: "var(--surface)",
        "text-on-light": "var(--text-on-light)",
        "text-on-dark": "var(--text-on-dark)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: "var(--sidebar)",
        "sidebar-foreground": "var(--sidebar-foreground)",
        "sidebar-primary": "var(--sidebar-primary)",
        "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
        "sidebar-accent": "var(--sidebar-accent)",
        "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
      },
      borderRadius: {
        // você só declarou --radius no globals.css — use-o como padrão para vários tamanhos
        sm: "calc(var(--radius) * 0.5)",
        md: "var(--radius)",
        lg: "calc(var(--radius) * 1.25)",
        xl: "calc(var(--radius) * 1.5)",
      },
      transitionTimingFunction: {
        DEFAULT: "ease-in-out",
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
    },
  },
  plugins: [
    // plugin opcional — remova se não for instalar
    require("tailwindcss-animate"),
  ],
};
