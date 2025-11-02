
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
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
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
    			tennis: {
    				purple: {
    					'50': '#f3f1ff',
    					'100': '#ebe5ff',
    					'200': '#d9ceff',
    					'300': '#bea6ff',
    					'400': '#9f75ff',
    					'500': '#843dff',
    					'600': '#7916ff',
    					'700': '#6b04fd',
    					'800': '#5a03d4',
    					'900': '#4b05ad',
    					'950': '#2c0076'
    				},
    				green: {
    					'50': '#f0fdf0',
    					'100': '#dcfce7',
    					'200': '#bbf7d0',
    					'300': '#86efac',
    					'400': '#4ade80',
    					'500': '#22c55e',
    					'600': '#16a34a',
    					'700': '#15803d',
    					'800': '#166534',
    					'900': '#14532d',
    					'950': '#052e16'
    				}
    			},
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			'fade-in': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(20px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'scale-in': {
    				'0%': {
    					transform: 'scale(0.95)',
    					opacity: '0'
    				},
    				'100%': {
    					transform: 'scale(1)',
    					opacity: '1'
    				}
    			},
    			'tennis-bounce': {
    				'0%, 100%': {
    					transform: 'translateY(0px) rotate(0deg)'
    				},
    				'33%': {
    					transform: 'translateY(-10px) rotate(120deg)'
    				},
    				'66%': {
    					transform: 'translateY(-5px) rotate(240deg)'
    				}
    			},
    			glow: {
    				'0%, 100%': {
    					boxShadow: '0 0 20px rgba(132, 61, 255, 0.3)'
    				},
    				'50%': {
    					boxShadow: '0 0 40px rgba(132, 61, 255, 0.6), 0 0 60px rgba(34, 197, 94, 0.3)'
    				}
    			},
    			'float-up': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(30px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'scale-bounce': {
    				'0%': {
    					transform: 'scale(0.95)'
    				},
    				'50%': {
    					transform: 'scale(1.05)'
    				},
    				'100%': {
    					transform: 'scale(1)'
    				}
    			},
    			'tennis-float': {
    				'0%, 100%': {
    					transform: 'translateY(0px) rotate(0deg)'
    				},
    				'33%': {
    					transform: 'translateY(-10px) rotate(120deg)'
    				},
    				'66%': {
    					transform: 'translateY(-5px) rotate(240deg)'
    				}
    			},
    			ripple: {
    				'0%': {
    					transform: 'scale(0)',
    					opacity: '1'
    				},
    				'100%': {
    					transform: 'scale(4)',
    					opacity: '0'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'fade-in': 'fade-in 0.6s ease-out',
    			'scale-in': 'scale-in 0.3s ease-out',
    			'tennis-bounce': 'tennis-bounce 3s ease-in-out infinite',
    			glow: 'glow 2s ease-in-out infinite',
    			'float-up': 'float-up 0.8s ease-out',
    			'scale-bounce': 'scale-bounce 0.4s ease-out',
    			'tennis-float': 'tennis-float 4s ease-in-out infinite',
    			ripple: 'ripple 0.6s linear'
    		},
    		backgroundImage: {
    			'tennis-gradient': 'linear-gradient(135deg, #6b04fd 0%, #22c55e 100%)',
    			'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
    		},
    		backdropBlur: {
    			xs: '2px'
    		},
    		boxShadow: {
    			'glow-purple': '0 0 20px rgba(132, 61, 255, 0.3)',
    			'glow-green': '0 0 20px rgba(34, 197, 94, 0.3)',
    			'glow-white': '0 0 20px rgba(255, 255, 255, 0.3)'
    		}
    	}
    },
	plugins: [
		require("tailwindcss-animate"),
		// RTL Support Plugin
		function({ addUtilities, addComponents, theme }) {
			// RTL Utility Classes
			addUtilities({
				// Direction utilities
				'.rtl': {
					direction: 'rtl',
				},
				'.ltr': {
					direction: 'ltr',
				},
				
				// RTL-safe margins
				'.ms-0': { 'margin-inline-start': '0' },
				'.ms-1': { 'margin-inline-start': '0.25rem' },
				'.ms-2': { 'margin-inline-start': '0.5rem' },
				'.ms-3': { 'margin-inline-start': '0.75rem' },
				'.ms-4': { 'margin-inline-start': '1rem' },
				'.ms-5': { 'margin-inline-start': '1.25rem' },
				'.ms-6': { 'margin-inline-start': '1.5rem' },
				'.ms-8': { 'margin-inline-start': '2rem' },
				'.ms-10': { 'margin-inline-start': '2.5rem' },
				'.ms-12': { 'margin-inline-start': '3rem' },
				'.ms-auto': { 'margin-inline-start': 'auto' },
				
				'.me-0': { 'margin-inline-end': '0' },
				'.me-1': { 'margin-inline-end': '0.25rem' },
				'.me-2': { 'margin-inline-end': '0.5rem' },
				'.me-3': { 'margin-inline-end': '0.75rem' },
				'.me-4': { 'margin-inline-end': '1rem' },
				'.me-5': { 'margin-inline-end': '1.25rem' },
				'.me-6': { 'margin-inline-end': '1.5rem' },
				'.me-8': { 'margin-inline-end': '2rem' },
				'.me-10': { 'margin-inline-end': '2.5rem' },
				'.me-12': { 'margin-inline-end': '3rem' },
				'.me-auto': { 'margin-inline-end': 'auto' },
				
				// RTL-safe padding
				'.ps-0': { 'padding-inline-start': '0' },
				'.ps-1': { 'padding-inline-start': '0.25rem' },
				'.ps-2': { 'padding-inline-start': '0.5rem' },
				'.ps-3': { 'padding-inline-start': '0.75rem' },
				'.ps-4': { 'padding-inline-start': '1rem' },
				'.ps-5': { 'padding-inline-start': '1.25rem' },
				'.ps-6': { 'padding-inline-start': '1.5rem' },
				'.ps-8': { 'padding-inline-start': '2rem' },
				'.ps-10': { 'padding-inline-start': '2.5rem' },
				'.ps-12': { 'padding-inline-start': '3rem' },
				
				'.pe-0': { 'padding-inline-end': '0' },
				'.pe-1': { 'padding-inline-end': '0.25rem' },
				'.pe-2': { 'padding-inline-end': '0.5rem' },
				'.pe-3': { 'padding-inline-end': '0.75rem' },
				'.pe-4': { 'padding-inline-end': '1rem' },
				'.pe-5': { 'padding-inline-end': '1.25rem' },
				'.pe-6': { 'padding-inline-end': '1.5rem' },
				'.pe-8': { 'padding-inline-end': '2rem' },
				'.pe-10': { 'padding-inline-end': '2.5rem' },
				'.pe-12': { 'padding-inline-end': '3rem' },
				
				// Text alignment
				'.text-start': { 'text-align': 'start' },
				'.text-end': { 'text-align': 'end' },
				
				// Border radius for RTL
				'.rounded-s': { 'border-start-start-radius': '0.25rem', 'border-end-start-radius': '0.25rem' },
				'.rounded-e': { 'border-start-end-radius': '0.25rem', 'border-end-end-radius': '0.25rem' },
				'.rounded-s-lg': { 'border-start-start-radius': '0.5rem', 'border-end-start-radius': '0.5rem' },
				'.rounded-e-lg': { 'border-start-end-radius': '0.5rem', 'border-end-end-radius': '0.5rem' },
				
				// Float utilities
				'.float-start': { float: 'inline-start' },
				'.float-end': { float: 'inline-end' },
				
				// Transform utilities for RTL
				'.rtl-flip': {
					transform: 'scaleX(-1)',
				},
				'.rtl-flip-y': {
					transform: 'scaleY(-1)',
				},
				
				// Position utilities
				'.start-0': { 'inset-inline-start': '0' },
				'.start-1': { 'inset-inline-start': '0.25rem' },
				'.start-2': { 'inset-inline-start': '0.5rem' },
				'.start-4': { 'inset-inline-start': '1rem' },
				'.start-auto': { 'inset-inline-start': 'auto' },
				
				'.end-0': { 'inset-inline-end': '0' },
				'.end-1': { 'inset-inline-end': '0.25rem' },
				'.end-2': { 'inset-inline-end': '0.5rem' },
				'.end-4': { 'inset-inline-end': '1rem' },
				'.end-auto': { 'inset-inline-end': 'auto' },
			});
			
			// RTL Component Classes
			addComponents({
				'.rtl-container': {
					'&.rtl': {
						direction: 'rtl',
						'text-align': 'right',
					},
					'&.ltr': {
						direction: 'ltr',
						'text-align': 'left',
					},
				},
				
				'.rtl-flex': {
					display: 'flex',
					'&.rtl': {
						'flex-direction': 'row-reverse',
					},
				},
				
				'.rtl-grid': {
					display: 'grid',
					'&.rtl': {
						direction: 'rtl',
					},
				},
			});
		}
	],
} satisfies Config;
