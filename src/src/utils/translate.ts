import { franc } from 'franc'

// Maps ISO 639-3 → ISO 639-1 for the translation API
const ISO639_3_TO_1: Record<string, string> = {
  afr: 'af', sqi: 'sq', amh: 'am', arb: 'ar', ara: 'ar', hye: 'hy',
  aze: 'az', eus: 'eu', bel: 'be', ben: 'bn', bos: 'bs', bul: 'bg',
  cat: 'ca', ceb: 'ceb', zho: 'zh', cos: 'co', hrv: 'hr', ces: 'cs',
  dan: 'da', nld: 'nl', eng: 'en', epo: 'eo', est: 'et', fin: 'fi',
  fra: 'fr', fry: 'fy', glg: 'gl', kat: 'ka', deu: 'de', ell: 'el',
  guj: 'gu', hat: 'ht', hau: 'ha', haw: 'haw', heb: 'he', hin: 'hi',
  hmn: 'hmn', hun: 'hu', isl: 'is', ibo: 'ig', ind: 'id', gle: 'ga',
  ita: 'it', jpn: 'ja', jav: 'jv', kan: 'kn', kaz: 'kk', khm: 'km',
  kin: 'rw', kor: 'ko', kur: 'ku', kir: 'ky', lao: 'lo', lat: 'la',
  lav: 'lv', lit: 'lt', ltz: 'lb', mkd: 'mk', mlg: 'mg', msa: 'ms',
  mal: 'ml', mlt: 'mt', mri: 'mi', mar: 'mr', mon: 'mn', mya: 'my',
  nep: 'ne', nor: 'no', nob: 'no', nya: 'ny', oci: 'oc', pus: 'ps',
  fas: 'fa', pol: 'pl', por: 'pt', pan: 'pa', ron: 'ro', rus: 'ru',
  smo: 'sm', gla: 'gd', srp: 'sr', sot: 'st', sna: 'sn', snd: 'sd',
  sin: 'si', slk: 'sk', slv: 'sl', som: 'so', spa: 'es', sun: 'su',
  swa: 'sw', swe: 'sv', tgl: 'tl', tgk: 'tg', tam: 'ta', tel: 'te',
  tha: 'th', tur: 'tr', tuk: 'tk', ukr: 'uk', urd: 'ur', uig: 'ug',
  uzb: 'uz', vie: 'vi', cym: 'cy', xho: 'xh', yid: 'yi', yor: 'yo',
  zul: 'zu',
}

const LANGUAGE_NAMES: Record<string, string> = {
  af: 'Afrikaans', sq: 'Albanian', am: 'Amharic', ar: 'Arabic',
  hy: 'Armenian', az: 'Azerbaijani', eu: 'Basque', be: 'Belarusian',
  bn: 'Bengali', bs: 'Bosnian', bg: 'Bulgarian', ca: 'Catalan',
  zh: 'Chinese', hr: 'Croatian', cs: 'Czech', da: 'Danish',
  nl: 'Dutch', eo: 'Esperanto', et: 'Estonian', fi: 'Finnish',
  fr: 'French', gl: 'Galician', ka: 'Georgian', de: 'German',
  el: 'Greek', gu: 'Gujarati', ht: 'Haitian Creole', ha: 'Hausa',
  he: 'Hebrew', hi: 'Hindi', hu: 'Hungarian', is: 'Icelandic',
  ig: 'Igbo', id: 'Indonesian', ga: 'Irish', it: 'Italian',
  ja: 'Japanese', jv: 'Javanese', kn: 'Kannada', kk: 'Kazakh',
  km: 'Khmer', rw: 'Kinyarwanda', ko: 'Korean', ku: 'Kurdish',
  ky: 'Kyrgyz', lo: 'Lao', la: 'Latin', lv: 'Latvian',
  lt: 'Lithuanian', lb: 'Luxembourgish', mk: 'Macedonian', mg: 'Malagasy',
  ms: 'Malay', ml: 'Malayalam', mt: 'Maltese', mi: 'Maori',
  mr: 'Marathi', mn: 'Mongolian', my: 'Myanmar', ne: 'Nepali',
  no: 'Norwegian', ny: 'Nyanja', ps: 'Pashto', fa: 'Persian',
  pl: 'Polish', pt: 'Portuguese', pa: 'Punjabi', ro: 'Romanian',
  ru: 'Russian', sm: 'Samoan', gd: 'Scots Gaelic', sr: 'Serbian',
  st: 'Sesotho', sn: 'Shona', sd: 'Sindhi', si: 'Sinhala',
  sk: 'Slovak', sl: 'Slovenian', so: 'Somali', es: 'Spanish',
  su: 'Sundanese', sw: 'Swahili', sv: 'Swedish', tl: 'Tagalog',
  tg: 'Tajik', ta: 'Tamil', te: 'Telugu', th: 'Thai',
  tr: 'Turkish', tk: 'Turkmen', uk: 'Ukrainian', ur: 'Urdu',
  ug: 'Uyghur', uz: 'Uzbek', vi: 'Vietnamese', cy: 'Welsh',
  xh: 'Xhosa', yi: 'Yiddish', yo: 'Yoruba', zu: 'Zulu',
}

export interface DetectedLanguage {
  code: string
  name: string
}

/** Returns detected language or null if English/undetermined. */
export function detectLanguage(text: string): DetectedLanguage | null {
  const sample = text.slice(0, 1500)
  const iso3 = franc(sample)
  if (iso3 === 'und' || iso3 === 'eng') return null

  const iso1 = ISO639_3_TO_1[iso3]
  if (!iso1 || iso1 === 'en') return null

  return { code: iso1, name: LANGUAGE_NAMES[iso1] ?? iso1 }
}

async function translateChunk(text: string, sourceLang: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|en`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Translation request failed (${response.status})`)
  const data = await response.json()
  if (data.responseStatus !== 200) throw new Error(data.responseDetails ?? 'Translation failed')
  return data.responseData.translatedText as string
}

/** Translates full transcript text to English using MyMemory API (free, no key). */
export async function translateToEnglish(text: string, sourceLang: string): Promise<string> {
  // Split into chunks ≤ 450 chars, breaking on newlines where possible
  const lines = text.split('\n')
  const chunks: string[] = []
  let current = ''

  for (const line of lines) {
    if ((current.length + line.length + 1) > 450 && current.length > 0) {
      chunks.push(current)
      current = line
    } else {
      current = current ? `${current}\n${line}` : line
    }
  }
  if (current) chunks.push(current)

  // Translate in small parallel batches to balance speed vs rate limits
  const BATCH_SIZE = 5
  const results: string[] = []
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)
    const translated = await Promise.all(batch.map(chunk => translateChunk(chunk, sourceLang)))
    results.push(...translated)
  }

  return results.join('\n')
}
