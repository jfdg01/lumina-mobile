/**
 * @deprecated This theme is being replaced by Gluestack UI tokens and NativeWind classes.
 */
export const theme = {
  colors: {
    background: '#000000',
    surface: '#0A0A0A',
    surfaceLight: '#1A1A1A',
    primary: '#00FFFF', // Cyber Cyan for a premium tech feel
    secondary: '#FF00FF', // Magenta accent (optional)
    text: '#FFFFFF',
    textMuted: '#888888',
    accent: '#00FFFF',
    danger: '#FF3B30',
    success: '#4CD964',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    full: 9999,
  },
  shadows: {
    glow: {
      shadowColor: '#00FFFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 5,
    }
  }
};
