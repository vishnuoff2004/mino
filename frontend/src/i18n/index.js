import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Papa from 'papaparse';
import enCSV from './locales/en.csv?raw';
import taCSV from './locales/ta.csv?raw';

function csvToNestedObject(csv, lang) {
  const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const translations = {};
  result.data.forEach((row) => {
    const key = row.key?.trim();
    const val = row[lang]?.trim();
    if (!key || !val) return;
    const parts = key.split('.');
    let current = translations;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = val;
  });
  return translations;
}

const enResources = csvToNestedObject(enCSV, 'en');
const taResources = csvToNestedObject(taCSV, 'ta');

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enResources },
    ta: { translation: taResources },
  },
  lng: localStorage.getItem('i18nextLng') || 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
