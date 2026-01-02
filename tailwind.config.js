/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ativa dark mode via classe .dark
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}", // adicione se usa src/
  ],
  theme: {
    extend: {
      colors: {
        // Paleta clara (default)
        primary: "#D9961A", // cor principal
        accent: "#EEF5F5",  // cor de destaque clara
        background: "#ffffff",
        foreground: "#171717", // texto padrão no modo claro

        // Paleta escura
        dark: {
          bg: "#171717",       // fundo escuro
          primary: "#D9961A",  // mantém a mesma cor principal
          accent: "#EEF5F5",   // texto claro
          foreground: "#EEF5F5",
        },

        // Variáveis já existentes para compatibilidade com shadcn/ui
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
    require("tailwindcss-animate"),
  ],
};
