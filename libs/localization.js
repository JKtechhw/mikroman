const translations = require("../locales/languages.json");
const { getCodeList, getName } = require('country-list');
const configEditor = require("./configEditor");

class localization {
    constructor() {}

    getTranslation(language) {
        let lang;

        if(typeof language == "undefined") {
            const ce = new configEditor();
            let config;
            try {
                config = ce.getConfig();

                if(typeof config.language == "undefined") {
                    const languages = require("../locales/languages.json");
                    lang = languages.default;
                }

                else {
                    lang = config.language;
                }
            }

            catch(e) {
                const languages = require("../locales/languages.json");
                lang = languages.default;
            }
        }

        else {
            lang = language.ToLowerCase();
        }

        const translation = {
            configuration: require(`../locales/${lang}/configuration.json`),
            login: require(`../locales/${lang}/login.json`),
            http_errors: require(`../locales/${lang}/http_errors.json`),
        }

        return translation;
    }

    getLanguages() {
        return translations.languages;
    }

    validateLanguage(lang) {
        if(Object.keys(translations.languages).includes(lang)) {
            return true;
        }

        return false;
    }

    getCountries() {
        return getCodeList();
    }

    validateCountry(country) {
        if(getName(country) == undefined) {
            return false;
        }

        return true;
    }
}

module.exports = localization;