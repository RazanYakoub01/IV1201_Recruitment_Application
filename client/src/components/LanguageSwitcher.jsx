
import { useTranslation } from 'react-i18next';
import React from 'react';


/**
 * LanguageSwitcher component allows users to switch the application's current language.
 * It utilizes the `useTranslation` hook from `react-i18next` to dynamically change the application's language.
 * 
 * @component
 * @returns {React.ReactElement} The LanguageSwitcher component.
 */
function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="language-switcher-container">
        <h3>
          {t("language_switcher.choose_language")}
        </h3>
        <select value={i18n.language} onChange={changeLanguage}>
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="sv">Svenska</option> 
        </select>
    </div>
  );
}

export default LanguageSwitcher;