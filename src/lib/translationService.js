const supportedLanguages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ur', label: 'اردو' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
];

const languageLabels = supportedLanguages.reduce((map, language) => {
  map[language.code] = language.label;
  return map;
}, {});

export function getSupportedLanguages() {
  return supportedLanguages;
}

export function getLanguageLabel(code) {
  return languageLabels[code] || 'Unknown';
}

export function detectLanguage(text = '') {
  const trimmed = String(text).trim();
  if (!trimmed) {
    return 'en';
  }

  const normalized = trimmed.toLowerCase();
  const devanagari = /[\u0900-\u097F]/;
  const arabicExtended = /[\u0600-\u06FF]/;
  const japanese = /[\u3040-\u30FF\u31F0-\u31FF]/;
  const chinese = /[\u4E00-\u9FFF]/;
  const marathiCommon = /(आहे|माझा|होय|नाही|कृपया|आणि)/;
  const urduCommon = /(ہ|ی|ک|گ|چ|ڈ|ڑ)/;
  const frenchCommon = /(\ble\b|\bla\b|\bet\b|\best\b|\bpour\b|\bdans\b|\bune\b)/;
  const spanishCommon = /(\bel\b|\bla\b|\by\b|\bque\b|\bpara\b|\bpor\b|\bun\b)/;
  const germanCommon = /(\bder\b|\bdie\b|\bund\b|\bist\b|\bnicht\b|\bwie\b)/;
  const englishCommon = /(\bthe\b|\band\b|\bis\b|\bto\b|\bfor\b|\bof\b|\bin\b)/;

  if (devanagari.test(trimmed)) {
    return marathiCommon.test(trimmed) ? 'mr' : 'hi';
  }

  if (arabicExtended.test(trimmed)) {
    return urduCommon.test(trimmed) ? 'ur' : 'ar';
  }

  if (japanese.test(trimmed)) {
    return 'ja';
  }

  if (chinese.test(trimmed)) {
    return 'zh';
  }

  if (frenchCommon.test(normalized)) {
    return 'fr';
  }

  if (spanishCommon.test(normalized)) {
    return 'es';
  }

  if (germanCommon.test(normalized)) {
    return 'de';
  }

  if (englishCommon.test(normalized)) {
    return 'en';
  }

  return 'en';
}

function fallbackTranslation(text, source, target) {
  const sourceLabel = getLanguageLabel(source);
  const targetLabel = getLanguageLabel(target);
  return `[${sourceLabel} → ${targetLabel}]\n${text}`;
}

export async function translateText(text, targetLanguage) {
  const sourceLanguage = detectLanguage(text);
  const normalizedTarget = targetLanguage === 'mr' ? 'hi' : targetLanguage;

  if (!text || sourceLanguage === normalizedTarget) {
    return text;
  }

  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLanguage,
        target: normalizedTarget,
        format: 'text',
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API returned status ${response.status}`);
    }

    const result = await response.json();
    return result.translatedText || fallbackTranslation(text, sourceLanguage, targetLanguage);
  } catch (error) {
    console.error(error);
    return fallbackTranslation(text, sourceLanguage, targetLanguage);
  }
}
