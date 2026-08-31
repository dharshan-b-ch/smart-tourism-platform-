import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, TRANSLATIONS } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });

  const setLanguage = (code) => {
    setLanguageState(code);
    localStorage.setItem('appLanguage', code);
  };

  // Initialize Google Translate Script for full-website dynamic translation
  useEffect(() => {
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,hi,te,ta,kn,ml,mr,bn,gu,pa,ur,or,as,ne,sd,sa,ks,sd,mai,sat,brx,doi,kok',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            },
            'google_translate_element'
          );
        }
      };
    }
  }, []);

  // Sync translation cookie & trigger full website translation whenever language changes
  useEffect(() => {
    const code = language === 'en' ? '' : language;
    
    // Set googtrans cookie for site-wide translation
    document.cookie = `googtrans=/en/${code}; path=/;`;
    if (window.location.hostname) {
      document.cookie = `googtrans=/en/${code}; domain=${window.location.hostname}; path=/;`;
    }

    // Trigger select change on Google Translate combo element if present
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = code || 'en';
      select.dispatchEvent(new Event('change'));
    }
  }, [language]);

  const currentLangObj = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const t = (key) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      LANGUAGES, 
      currentLangObj,
      speechLang: currentLangObj.speechLang 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
