/**
 * The source design system uses device-provided sans-serif and serif fonts.
 * They are available immediately and do not need asynchronous font loading.
 */
export function useDesignSystemFonts() {
  return { fontsLoaded: true, fontError: null };
}
