/**
 * AIVTA 2026 Conference Website - Internationalization (i18n)
 * Handles English/Chinese language switching
 */

(function() {
    'use strict';

    // Default language
    const DEFAULT_LANG = 'en';
    const STORAGE_KEY = 'aivta-language';

    // Initialize language on DOM ready
    document.addEventListener('DOMContentLoaded', initI18n);

    /**
     * Initialize internationalization
     */
    function initI18n() {
        // Get saved language or use default
        const savedLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;

        // Apply saved language
        setLanguage(savedLang);

        // Set up language switcher
        initLanguageSwitcher();
    }

    /**
     * Initialize language switcher button
     */
    function initLanguageSwitcher() {
        const switcher = document.getElementById('lang-switch');
        if (!switcher) return;

        switcher.addEventListener('click', function(e) {
            e.preventDefault();
            const currentLang = document.documentElement.lang || DEFAULT_LANG;
            const newLang = currentLang === 'en' ? 'zh' : 'en';
            setLanguage(newLang);
        });
    }

    /**
     * Set the page language
     * @param {string} lang - Language code ('en' or 'zh')
     */
    function setLanguage(lang) {
        // Validate language
        if (lang !== 'en' && lang !== 'zh') {
            lang = DEFAULT_LANG;
        }

        // Save preference
        localStorage.setItem(STORAGE_KEY, lang);

        // Set HTML lang attribute
        document.documentElement.lang = lang;

        // Update all translatable elements
        updatePageContent(lang);

        // Update language switcher button text
        updateSwitcherText(lang);
    }

    /**
     * Update all page content based on language
     * @param {string} lang - Language code
     */
    function updatePageContent(lang) {
        // Find all elements with data-en and data-zh attributes
        const elements = document.querySelectorAll('[data-en][data-zh]');

        elements.forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text) {
                // Check if element has child nodes that should be preserved
                if (el.childElementCount === 0) {
                    el.textContent = text;
                } else {
                    // For elements with children, only update direct text content
                    // This handles cases where we have icons or other elements
                    const textNode = Array.from(el.childNodes).find(
                        node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
                    );
                    if (textNode) {
                        textNode.textContent = text;
                    } else {
                        // If no text node found, set as textContent
                        // but preserve any existing child elements
                        const children = Array.from(el.children);
                        el.textContent = text;
                        children.forEach(child => {
                            if (child.tagName) {
                                el.appendChild(child);
                            }
                        });
                    }
                }
            }
        });

        // Update elements with only one language attribute (placeholder handling)
        const enOnlyElements = document.querySelectorAll('[data-en]:not([data-zh])');
        const zhOnlyElements = document.querySelectorAll('[data-zh]:not([data-en])');

        enOnlyElements.forEach(el => {
            el.style.display = lang === 'en' ? '' : 'none';
        });

        zhOnlyElements.forEach(el => {
            el.style.display = lang === 'zh' ? '' : 'none';
        });

        // Handle input placeholders
        document.querySelectorAll('[data-placeholder-en][data-placeholder-zh]').forEach(el => {
            el.placeholder = el.getAttribute(`data-placeholder-${lang}`);
        });

        // Handle titles
        document.querySelectorAll('[data-title-en][data-title-zh]').forEach(el => {
            el.title = el.getAttribute(`data-title-${lang}`);
        });

        // Update page title if specified
        const titleEl = document.querySelector('title[data-en][data-zh]');
        if (titleEl) {
            document.title = titleEl.getAttribute(`data-${lang}`);
        }
    }

    /**
     * Update the language switcher button text
     * @param {string} currentLang - Current language code
     */
    function updateSwitcherText(currentLang) {
        const switcher = document.getElementById('lang-switch');
        if (!switcher) return;

        // Show the opposite language option
        if (currentLang === 'en') {
            switcher.textContent = '中文';
            switcher.setAttribute('title', 'Switch to Chinese');
        } else {
            switcher.textContent = 'English';
            switcher.setAttribute('title', '切换到英文');
        }
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    function getCurrentLanguage() {
        return document.documentElement.lang || localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    }

    // Expose functions globally for external use
    window.AIVTA_i18n = {
        setLanguage: setLanguage,
        getCurrentLanguage: getCurrentLanguage
    };

})();
