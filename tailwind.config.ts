import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'sans': ['Outfit', 'system-ui', 'sans-serif'],
        'display': ['Space Grotesk', 'system-ui', 'sans-serif'],
        'groovy': ['Space Grotesk', 'system-ui', 'sans-serif'],
        'retro': ['Space Grotesk', 'sans-serif'],
        'bubble': ['Outfit', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        hippie: {
          coral: "hsl(var(--hippie-coral))",
          peach: "hsl(var(--hippie-peach))",
          amber: "hsl(var(--hippie-amber))",
          sage: "hsl(var(--hippie-sage))",
          teal: "hsl(var(--hippie-teal))",
          lavender: "hsl(var(--hippie-lavender))",
          // Legacy aliases for backwards compatibility
          pink: "hsl(var(--hippie-coral))",
          orange: "hsl(var(--hippie-peach))",
          yellow: "hsl(var(--hippie-amber))",
          green: "hsl(var(--hippie-sage))",
          blue: "hsl(var(--hippie-teal))",
          purple: "hsl(var(--hippie-lavender))",
        },
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-sunset': 'var(--gradient-sunset)',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'glow': 'var(--shadow-glow)',
        'elevated': 'var(--shadow-elevated)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "paw-bounce": {
          "0%, 100%": { transform: "translateY(0) rotate(-5deg)" },
          "50%": { transform: "translateY(-10px) rotate(5deg)" },
        },
        "paw-walk": {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.9)" },
          "50%": { opacity: "0.6", transform: "scale(1.05)" },
        },
        "paw-pad": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "paw-toe-1": { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-2px)" } },
        "paw-toe-2": { "0%, 100%": { transform: "translateY(0)" }, "60%": { transform: "translateY(-3px)" } },
        "paw-toe-3": { "0%, 100%": { transform: "translateY(0)" }, "70%": { transform: "translateY(-3px)" } },
        "paw-toe-4": { "0%, 100%": { transform: "translateY(0)" }, "80%": { transform: "translateY(-2px)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "paw-bounce": "paw-bounce 2s ease-in-out infinite",
        "paw-walk": "paw-walk 3s ease-in-out infinite",
        "paw-pad": "paw-pad 1.5s ease-in-out infinite",
        "paw-toe-1": "paw-toe-1 1.5s ease-in-out infinite",
        "paw-toe-2": "paw-toe-2 1.5s ease-in-out infinite 0.1s",
        "paw-toe-3": "paw-toe-3 1.5s ease-in-out infinite 0.2s",
        "paw-toe-4": "paw-toe-4 1.5s ease-in-out infinite 0.3s",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
