import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // Couleurs basées sur le logo Chadia
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#e8f1fc',
          100: '#c5dcf7',
          200: '#9ec5f1',
          300: '#77adeb',
          400: '#5a9be6',
          500: '#3d89e1',
          600: '#1e5cb3', // Couleur principale du logo
          700: '#1a4f9a',
          800: '#164281',
          900: '#123568',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          50: '#fef9e7',
          100: '#fcefc3',
          200: '#f9e49b',
          300: '#f7d873',
          400: '#f4c84d',
          500: '#f4b41a', // Jaune du logo
          600: '#d99e17',
          700: '#be8814',
        },
        // Vert du logo pour les succès
        success: {
          50: '#e9f5ed',
          100: '#c7e6d1',
          200: '#a2d6b3',
          300: '#7dc695',
          400: '#5bb97f',
          500: '#2d8c4e', // Vert du logo
          600: '#277a44',
          700: '#21683a',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(30, 64, 175, 0.05)',
        'soft-md':
          '0 4px 6px -1px rgba(30, 64, 175, 0.1), 0 2px 4px -1px rgba(30, 64, 175, 0.06)',
        'soft-lg':
          '0 10px 15px -3px rgba(30, 64, 175, 0.1), 0 4px 6px -2px rgba(30, 64, 175, 0.05)',
        'soft-xl':
          '0 20px 25px -5px rgba(30, 64, 175, 0.1), 0 10px 10px -5px rgba(30, 64, 175, 0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
