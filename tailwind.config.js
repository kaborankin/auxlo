/** @type {import('tailwindcss').Config} */
module.exports = {
  // Use class-based dark mode
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/shadcn-ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./components-shadcn/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [require("tailwindcss-animate")],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontSize: {
        'base': '16px',
        'sm': '14px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
      },
      fontFamily: {
        sans: [
          'Inter',
          'var(--font-sans)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        heading: [
          'var(--font-heading)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif'
        ],
        inter: ['Inter', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        manrope: ['Manrope', 'var(--font-manrope)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace'
        ]
      },
      colors: {
        pajo: {
          bg: '#F7F8F6',
          surface: '#FFFFFF',
          primary: '#111827', // Near black/navy
          secondary: '#667085', // Muted slate
          border: '#E5E7EB',
          accent: '#16845B', // Restrained green/teal
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
        },
        sb: {
          bg: 'var(--sb-bg)',
          surface: 'var(--sb-surface)',
          primary: 'var(--sb-primary)',
          accent: 'var(--sb-accent)',
          text: 'var(--sb-text)',
          muted: 'var(--sb-muted)',
          border: 'var(--sb-border)',
        },
        auxlo: {
          black: '#080A08',
          surface: '#101310',
          elevated: '#171A16',
          text: '#F3F4EF',
          muted: '#A5AAA0',
          lime: '#C8FF00',
          // Backend design system tokens (dashboard)
          line: 'rgba(243, 244, 239, 0.07)',
          success: '#45B97C',
          warning: '#E3B341',
          danger: '#E06C6C',
          info: '#7DA2E8',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
        ,
        cta: {
          DEFAULT: 'hsl(var(--cta))',
          hover: 'hsl(var(--cta-hover))',
          active: 'hsl(var(--cta-active))',
          foreground: 'hsl(var(--cta-foreground))'
        }
      },
      borderRadius: {
        'pajo': '12px',
        'sb-sm': 'var(--sb-radius-sm)',
        'sb-md': 'var(--sb-radius-md)',
        'sb-lg': 'var(--sb-radius-lg)',
        'sb-xl': 'var(--sb-radius-xl)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'scroll-slow': 'scroll-slow 30s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        'scroll-slow': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      }
    }
  }
}