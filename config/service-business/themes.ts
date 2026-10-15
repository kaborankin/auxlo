import type { Theme, ThemeKey } from '@/types/service-business';

/**
 * The reference themes. Same components, completely different
 * visual identity — colours, radius and typography all flow from here.
 */
export const themes: Record<ThemeKey, Theme> = {
  /**
   * Bang Visuals — dark editorial photography theme built from the logo:
   * matte black base (matches the logo circle so the header blends), the
   * logo's electric blue as the single accent, near-white text. Compact
   * radius keeps it sharp; Space Grotesk headings echo the logo wordmark.
   */
  bang: {
    key: 'bang',
    name: 'Bang Studio',
    colors: {
      background: '#060607', // matte black — matches the logo circle
      surface: '#0E0E12', // lifted panel for cards/nav surfaces
      primary: '#F4F4F6', // near-white for primary buttons / strong text
      accent: '#2E6BFF', // electric blue sampled from the logo
      text: '#F4F4F6',
      muted: '#9DA0AB',
      border: '#1E1E26',
    },
    radius: { sm: '6px', md: '10px', lg: '16px', xl: '24px' },
    fonts: { heading: 'space-grotesk', body: 'dm-sans' },
  },
  professional: {
    key: 'professional',
    name: 'Premium Professional',
    colors: {
      background: '#F7F5F1',
      surface: '#FFFFFF',
      primary: '#1F2937',
      accent: '#B88962',
      text: '#171717',
      muted: '#6B7280',
      border: '#E5E1DA',
    },
    radius: { sm: '8px', md: '14px', lg: '20px', xl: '28px' },
    fonts: { heading: 'manrope', body: 'inter' },
  },
  healthcare: {
    key: 'healthcare',
    name: 'Modern Healthcare',
    colors: {
      background: '#F4F8F7',
      surface: '#FFFFFF',
      primary: '#1D4D4F',
      accent: '#7BB8A9',
      text: '#172321',
      muted: '#5F7370',
      border: '#DCE8E5',
    },
    radius: { sm: '10px', md: '16px', lg: '24px', xl: '32px' },
    fonts: { heading: 'dm-sans', body: 'dm-sans' },
  },
  beauty: {
    key: 'beauty',
    name: 'Luxury Beauty',
    colors: {
      background: '#F8F3F0',
      surface: '#FFFFFF',
      primary: '#5C3E3A',
      accent: '#D8A6A0',
      text: '#241E1D',
      muted: '#8A7672',
      border: '#EBDFDA',
    },
    radius: { sm: '4px', md: '10px', lg: '16px', xl: '24px' },
    fonts: { heading: 'cormorant', body: 'inter' },
  },
  trades: {
    key: 'trades',
    name: 'Trades & Construction',
    colors: {
      background: '#F4F4F2',
      surface: '#FFFFFF',
      primary: '#252525',
      accent: '#D6A928',
      text: '#171717',
      muted: '#63635E',
      border: '#E2E2DC',
    },
    radius: { sm: '6px', md: '12px', lg: '18px', xl: '26px' },
    fonts: { heading: 'space-grotesk', body: 'inter' },
  },
  /**
   * SafePoint Consulting — built from the existing logo (charcoal + SafePoint
   * green), not a generic navy. Clean consultancy feel: deep charcoal for
   * text/primary, confident green for CTAs and highlights, warm off-white
   * background, soft light-green surfaces where a tinted panel is needed.
   */
  safepoint: {
    key: 'safepoint',
    name: 'SafePoint Compliance',
    colors: {
      background: '#F8FAF7', // warm off-white
      surface: '#FFFFFF',
      primary: '#172027', // deep charcoal — text, nav, footer, primary buttons
      accent: '#4FAF32', // SafePoint green — CTAs, icons, highlights
      text: '#172027',
      muted: '#5B6B61',
      border: '#E3EAE2',
    },
    radius: { sm: '8px', md: '14px', lg: '20px', xl: '28px' },
    fonts: { heading: 'manrope', body: 'inter' },
  },
};

export function getTheme(key: ThemeKey): Theme {
  return themes[key];
}
