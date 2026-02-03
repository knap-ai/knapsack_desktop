/*eslint-env node*/
/** @type {import('tailwindcss').Config} */
export default module = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",

    // tremor
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    transparent: "transparent",
    current: "currentColor",
    extend: {
      placeholderColor: ['active', 'focus'],
      screens: {
        "2xl": "1420px",
        "3xl": "1700px",
      },
      fontFamily: {
        'primary': ['var(--font-primary)'],
        'secondary': ['var(--font-secondary)'],
        'serif': ['var(--font-serif)'],
        Inter:['Inter', 'sans-serif'],
        Lora: ['Lora', 'serif'],
        InterTight: ['InterTight', 'sans-serif'],
        RobotoMono: ['RobotoMono', 'mono'],
      },
      width: {
        "message-xs": "450px",
        "message-sm": "550px",
        "message-default": "740px",
        "searchbar-xs": "560px",
        "searchbar-sm": "660px",
        searchbar: "850px",
        "document-sidebar": "800px",
        "document-sidebar-large": "1000px",
      },
      maxWidth: {
        "document-sidebar": "1000px",
      },
      text: {
        'size-emphasized': '13px',
      },
      leading: {
        'body': '20px',
        'large': '20px',
      },
      colors: {
        // Colors following site redesign
        'ks-bg-main': '#FAFAFA',
        'ks-red-50': '#FCF4F4',
        'ks-red-60': '#FCF4F4',
        'ks-red-100': '#FAE7E6',
        'ks-red-200': '#F6D4D2',
        'ks-red-300': '#EFB5B2',
        'ks-red-400': '#E48A85',
        'ks-red-500': '#D6635D',
        'ks-red-600': '#C14841',
        'ks-red-700': '#A23933',
        'ks-red-800': '#913631',
        'ks-red-900': '#712F2B',
        'ks-red-950': '#3C1513',
        'ks-white-text': '#F2F2F2',

        'bg-red-main': '#983B3B',
        'bg-red-400': '#913B34',
        'bg-red-500': '#71322D',

        'ks-warm-grey-50': '#F7F6F6',
        'ks-warm-grey-100': '#F0EFEF',
        'ks-warm-grey-200': '#E3E2E2',
        'ks-warm-grey-300': '#D1D0D0',
        'ks-warm-grey-400': '#B8B7B7',
        'ks-warm-grey-500': '#ABA9A9',
        'ks-warm-grey-600': '#969595',
        'ks-warm-grey-700': '#828180',
        'ks-warm-grey-800': '#6A6969',
        'ks-warm-grey-900': '#585757',
        'ks-warm-grey-950': '#333333',
        'ks-neutral': '#E5E5E5',
        'ks-neutral-50': '#F9FAFB',
        'ks-neutral-100': '#F2F4F7',
        'ks-neutral-200': '#E4E7EC',
        'ks-neutral-500': '#667085',
        'ks-neutral-700': '#344054',

        'ks-gunpowder-100': '#E6EBF3',
        'ks-gunpowder-200': '#D3DBEA',
        'ks-gunpowder-300': '#B5C4DB',
        'ks-gunpowder-400': '#91A5C9',
        'ks-gunpowder-500': '#768ABB',
        'ks-gunpowder-600': '#6474AC',
        'ks-gunpowder-700': '#58649D',
        'ks-gunpowder-800': '#4C5481',
        'ks-gunpowder-900': '#373D59',
        'ks-gunpowder-950': '#2A2D41',
        'ks-gunpowder-1000': '#232739',

        // Colors before site redesign
        'blue-600': 'var(--color-blue-600)',
        'blue-700': 'var(--color-blue-700)',
        'orange-600': 'var(--color-orange-600)',
        'danger': 'var(--color-danger)',
        'danger-2': 'var(--color-danger-2)',
        'button-lightgray': 'var(--button-lightgray)',
        'black': 'var(--color-black)',
        'stone-400': 'var(--color-stone-400)',
        'color-link': 'var(--color-link)',
        'zinc-200': 'var(--color-zinc-200)',
        'zinc-400': 'var(--color-zinc-400)',
         'zinc-500': 'var(--color-zinc-500)',
         'zinc-700': 'var(--color-zinc-700)',
         'zinc-800': 'var(--color-zinc-800)',
        'subtext-gray': 'var(--color-subtext-gray)',
        'kn-color-bg-gray': '#252524',
        'kn-color-border-gray': '#d2d2dc',
        'kn-color-border-dark-gray': '#a2a2ac',
        'kn-color-blue': '#1566BB',
        'kn-color-green': '#9BD058',
        'kn-color-pill-gray': '#656463',
        'body-text': '#20242A',
        'soft-gray': '#959493',
        link: "#3b82f6", // blue-500
        subtle: "#6b7280", // gray-500
        default: "#4b5563", // gray-600
        emphasis: "#374151", // gray-700
        strong: "#111827", // gray-900
        inverted: "#ffffff", // white
        background: "#f9fafb", // gray-50
        "background-emphasis": "#f6f7f8",
        "background-strong": "#eaecef",
        border: "#e5e7eb", // gray-200
        "border-light": "#f3f4f6", // gray-100
        "border-strong": "#9ca3af", // gray-400
        "hover-light": "#f3f4f6", // gray-100
        hover: "#e5e7eb", // gray-200
        popup: "#ffffff", // white
        accent: "#6671d0",
        "accent-hover": "#6671d0",
        highlight: {
          text: "#fef9c3", // yellow-100
        },
        error: "#ef4444", // red-500
        success: "#059669", // emerald-600
        alert: "#f59e0b", // amber-600
        user: "#fb7185", // yellow-400
        ai: "#60a5fa", // blue-400
        // light mode
        tremor: {
          brand: {
            faint: "#eff6ff", // blue-50
            muted: "#bfdbfe", // blue-200
            subtle: "#60a5fa", // blue-400
            DEFAULT: "#3b82f6", // blue-500
            emphasis: "#1d4ed8", // blue-700
            inverted: "#ffffff", // white
          },
          background: {
            muted: "#f9fafb", // gray-50
            subtle: "#f3f4f6", // gray-100
            DEFAULT: "#ffffff", // white
            emphasis: "#374151", // gray-700
          },
          border: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          ring: {
            DEFAULT: "#e5e7eb", // gray-200
          },
          content: {
            subtle: "#9ca3af", // gray-400
            DEFAULT: "#4b5563", // gray-600
            emphasis: "#374151", // gray-700
            strong: "#111827", // gray-900
            inverted: "#ffffff", // white
          },
        },
        // dark mode
        "dark-tremor": {
          brand: {
            faint: "#0B1229", // custom
            muted: "#172554", // blue-950
            subtle: "#1e40af", // blue-800
            DEFAULT: "#3b82f6", // blue-500
            emphasis: "#60a5fa", // blue-400
            inverted: "#030712", // gray-950
          },
          background: {
            muted: "#131A2B", // custom
            subtle: "#1f2937", // gray-800
            DEFAULT: "#111827", // gray-900
            emphasis: "#d1d5db", // gray-300
          },
          border: {
            DEFAULT: "#1f2937", // gray-800
          },
          ring: {
            DEFAULT: "#1f2937", // gray-800
          },
          content: {
            subtle: "#6b7280", // gray-500
            DEFAULT: "#d1d5db", // gray-300
            emphasis: "#f3f4f6", // gray-100
            strong: "#f9fafb", // gray-50
            inverted: "#000000", // black
          },
        },
      },
      boxShadow: {
        // light
        "tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        // dark
        "dark-tremor-input": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "dark-tremor-card":
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "dark-tremor-dropdown":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        "tremor-small": "0.375rem",
        "tremor-default": "0.5rem",
        "tremor-full": "9999px",

      },
      fontSize: {
        xxxs: 'var(--font-size-xxxs)',
        xxs: 'var(--font-size-xxs)',
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
        "tremor-label": ["0.75rem"],
        "tremor-default": ["0.875rem", { lineHeight: "1.25rem" }],
        "tremor-title": ["1.125rem", { lineHeight: "1.75rem" }],
        "tremor-metric": ["1.875rem", { lineHeight: "2.25rem" }],

        // Knapsack font sizes
        'subsubtext': '0.625rem',  // 10px
        'subtext': '0.75rem',  // 12px
        'emphasized': '0.8125rem',  // 13px
        'body': '0.875rem',  // 14px
        'large': '1rem',  // 16px
        'title2': '1.0625rem',  // 17px
        'title3': '1.125rem',
      },
      lineHeight: {
        none: 'var(--line-height-none)',
        tight: 'var(--line-height-tight)',
        normal: 'var(--line-height-normal)',
        emphasized: 'var(--line-height-emphasized)',
        loose: 'var(--line-height-loose)',
        body: '20px',
      },
      spacing: {
        'kn-full-height-adjustment': '108px'
      },
      letterSpacing: {
        'thread-title': '0.05em',
      }
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [
    require("@tailwindcss/typography"),
    require("@headlessui/tailwindcss"),
  ],
};
