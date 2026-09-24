/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      aspectRatio: {
        video: '16 / 9',
      },
      colors: {
        // Surfaces
        'Navbar': "#000000",
        'Borders': "#333333",
        'Separator': "#e5e5e5",

        // Text scale
        'Text': "#000000",
        'TextSm': "#333333",
        'TextL': "#666666",
        'TextXl': "#999999",
        'Text2Xl': "#cccccc",
        'Title': "#000000",

        // Buttons / controls
        'LoadVideo': "#000000",
        'LoadVideoHover': "#333333",
        'Play': "#666666",
        'PlayHover': "#000000",
        'Pause': "#666666",
        'PauseHover': "#000000",
        'Stop': "#666666",
        'StopHover': "#000000",
        'Ff-Fr': "#333333",
        'Ff-FrHover': "#000000",
        'Cue': "#000000",
        'CueHover': "#333333",
        'Layers': "#666666",
        'LayersHover': "#e5e5e5",
        'LayersToggle': "#e5e5e5",
        'LayersToggleHover': "#666666",
        'BeatTap': "#ffffff",
        'Bpm': "#000000",
        'Save': "#ffffff",
        'Cancel': "#666666",
        'Exit': "#666666",
        'ExitHighlight': "#000000",
        'Edit': "#000000",
        'DeleteCue': "#666666",
        'CueDivider': "#e5e5e5",

        // Inputs
        'InputBpm': "#333333",
        'BeatBall': "#ffffff",
        'Signature': "#333333",
        'Metronome': "#000000",
        'Numeration': "#333333",
        'Note': "#333333",
        'Time': "#000000",
        'JumpTo': "#e5e5e5",
        'JumpToTextHover': "#ffffff",
        'BeatNumber': "#ffffff",
        'InputboxColor': "#333333",
        'InputboxHighlight': "#000000",
        'CueFormBorders': "#333333",
        'InputText': "#000000",
      },
      borderRadius: {
        'pill': '9999px',
        'card': '1rem',
        'inner': '0.75rem',
        'control': '0.5rem',
        'input': '0.625rem',
      },
      spacing: {
        'control-h': '2.25rem',
        'control-lg': '2.6875rem',
      },
      fontSize: {
        'label': ['0.625rem', { letterSpacing: '0.08em', lineHeight: '1' }],
        'eyebrow': ['0.6875rem', { letterSpacing: '0.18em', lineHeight: '1' }],
        'meta': ['0.6875rem', { lineHeight: '1' }],
        'body': ['0.8125rem', { lineHeight: '1.5' }],
        'ui': ['0.875rem', { lineHeight: '1.4' }],
      },
    },
  },
  plugins: [],
  corePlugins: {
    aspectRatio: false,
  }
}