export const VIRASYA_LANG_CHANGE_EVENT = 'virasya:languageChange';

export const CODE_TO_LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
};

export const LANGUAGE_TO_CODE_MAP: Record<string, string> = {
  English: 'en',
  Hindi: 'hi',
  Tamil: 'ta',
  Bengali: 'bn',
  Marathi: 'mr',
  Gujarati: 'gu',
  Telugu: 'te',
  Kannada: 'kn',
  Malayalam: 'ml',
  Punjabi: 'pa',
};

/**
 * Client-side utility for full-page UI translation via Google Translate widget.
 * Synchronizes DOM text node translation across the entire page and notifies
 * reactive form components via a global window custom event.
 */
export function triggerFullPageTranslation(langCode: string) {
  if (typeof window === 'undefined') return;

  // Broadcast global event so form state, catalogers, and preview components sync
  try {
    window.dispatchEvent(
      new CustomEvent(VIRASYA_LANG_CHANGE_EVENT, {
        detail: {
          langCode,
          languageName: CODE_TO_LANGUAGE_MAP[langCode] || 'English',
        },
      })
    );
  } catch (err) {
    console.warn('Failed to dispatch language change event:', err);
  }

  if (langCode === 'en') {
    // Explicitly clear both cookie variants so "Show original" and our own
    // language switcher revert can fully restore the page to English.
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;

    const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElement) {
      selectElement.value = 'en';
      selectElement.dispatchEvent(new Event('change'));
    }
    return;
  }

  // Set ONLY path-based cookie — no domain= attribute.
  document.cookie = `googtrans=/en/${langCode}; path=/`;

  // Dispatch change event to the Google Translate element combo box
  const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
  if (selectElement) {
    selectElement.value = langCode;
    selectElement.dispatchEvent(new Event('change'));
  } else {
    // Widget still mounting — poll until combo is in DOM
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (combo) {
        combo.value = langCode;
        combo.dispatchEvent(new Event('change'));
        clearInterval(interval);
      } else if (attempts > 15) {
        clearInterval(interval);
      }
    }, 150);
  }
}
