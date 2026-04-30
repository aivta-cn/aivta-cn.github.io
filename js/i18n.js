/**
 * AIVTA 2026 - Internationalization (i18n)
 * Handles English/Chinese language switching via data-en/data-zh attributes.
 */
(function() {
    'use strict';

    var DEFAULT_LANG = 'en';
    var STORAGE_KEY = 'aivta-language';

    function getSavedLang() {
        try {
            return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
        } catch (e) {
            return DEFAULT_LANG;
        }
    }

    function saveLang(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (e) {
            // localStorage unavailable (private browsing, quota) — silent degradation
        }
    }

    function setLanguage(lang) {
        if (lang !== 'en' && lang !== 'zh') {
            lang = DEFAULT_LANG;
        }

        saveLang(lang);
        document.documentElement.lang = lang;

        updatePageContent(lang);
        updateSwitcherText(lang);
    }

    function updatePageContent(lang) {
        var elements = document.querySelectorAll('[data-en][data-zh]');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            var text = el.getAttribute('data-' + lang);
            if (!text) continue;

            if (el.childElementCount === 0) {
                el.textContent = text;
            } else {
                // Preserve child elements, update only direct text nodes
                var children = [];
                for (var c = 0; c < el.children.length; c++) {
                    children.push(el.children[c]);
                }
                el.textContent = text;
                for (var j = 0; j < children.length; j++) {
                    el.appendChild(children[j]);
                }
            }
        }

        // Toggle language-only elements
        var enOnly = document.querySelectorAll('[data-en]:not([data-zh])');
        var zhOnly = document.querySelectorAll('[data-zh]:not([data-en])');
        for (var k = 0; k < enOnly.length; k++) {
            enOnly[k].style.display = lang === 'en' ? '' : 'none';
        }
        for (var m = 0; m < zhOnly.length; m++) {
            zhOnly[m].style.display = lang === 'zh' ? '' : 'none';
        }

        // Update placeholders
        var phEls = document.querySelectorAll('[data-placeholder-en][data-placeholder-zh]');
        for (var n = 0; n < phEls.length; n++) {
            phEls[n].placeholder = phEls[n].getAttribute('data-placeholder-' + lang);
        }

        // Update title attributes
        var titleEls = document.querySelectorAll('[data-title-en][data-title-zh]');
        for (var p = 0; p < titleEls.length; p++) {
            titleEls[p].title = titleEls[p].getAttribute('data-title-' + lang);
        }

        // Update <title> tag
        var pageTitle = document.querySelector('title[data-en][data-zh]');
        if (pageTitle) {
            document.title = pageTitle.getAttribute('data-' + lang);
        }
    }

    function updateSwitcherText(currentLang) {
        var switcher = document.getElementById('lang-switch');
        if (!switcher) return;

        if (currentLang === 'en') {
            switcher.textContent = '中文';
            switcher.setAttribute('aria-label', 'Switch to Chinese');
        } else {
            switcher.textContent = 'English';
            switcher.setAttribute('aria-label', 'Switch to English');
        }
    }

    function init() {
        var saved = getSavedLang();
        setLanguage(saved);

        var switcher = document.getElementById('lang-switch');
        if (switcher) {
            switcher.addEventListener('click', function(e) {
                e.preventDefault();
                var newLang = document.documentElement.lang === 'en' ? 'zh' : 'en';
                setLanguage(newLang);
            });
        }
    }

    // Use readyState to avoid DOMContentLoaded race conditions
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.AIVTA_i18n = {
        setLanguage: setLanguage,
        getCurrentLanguage: function() {
            return document.documentElement.lang || DEFAULT_LANG;
        }
    };
})();
