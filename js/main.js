/**
 * AIVTA 2026 - Main JavaScript
 * Handles countdown timer, mobile menu, tabs, smooth scrolling, header scroll.
 */
(function() {
    'use strict';

    // Read conference date from embedded JSON, fallback to hardcoded
    var CONFERENCE_DATE = 'November 13, 2026 09:00:00';
    try {
        var dataScript = document.getElementById('aivta-site-data');
        if (dataScript) {
            var data = JSON.parse(dataScript.textContent);
            if (data.conferenceDate) {
                CONFERENCE_DATE = data.conferenceDate + 'T09:00:00';
            }
        }
    } catch (e) {
        // Fallback to hardcoded date
    }

    // ── Countdown Timer ──────────────────────────────────
    function initCountdown() {
        var countdownEl = document.getElementById('countdown');
        if (!countdownEl) return;

        var conferenceTime = new Date(CONFERENCE_DATE).getTime();

        function update() {
            var distance = conferenceTime - Date.now();

            if (distance < 0) {
                countdownEl.innerHTML = '<p class="countdown-ended">' +
                    (document.documentElement.lang === 'zh' ? '会议已开始！' : 'Conference has started!') +
                    '</p>';
                return;
            }

            var days = Math.floor(distance / 86400000);
            var hours = Math.floor((distance % 86400000) / 3600000);
            var minutes = Math.floor((distance % 3600000) / 60000);
            var seconds = Math.floor((distance % 60000) / 1000);

            var setText = function(id, val) {
                var el = document.getElementById(id);
                if (el) el.textContent = val;
            };
            setText('countdown-days', days);
            setText('countdown-hours', String(hours).padStart(2, '0'));
            setText('countdown-minutes', String(minutes).padStart(2, '0'));
            setText('countdown-seconds', String(seconds).padStart(2, '0'));
        }

        update();
        setInterval(update, 1000);
    }

    // ── Mobile Menu ──────────────────────────────────────
    function initMobileMenu() {
        var btn = document.querySelector('.mobile-menu-btn');
        var nav = document.querySelector('.nav');
        if (!btn || !nav) return;

        btn.addEventListener('click', function() {
            var isOpen = !nav.classList.contains('active');
            nav.classList.toggle('active');
            btn.classList.toggle('active');
            btn.setAttribute('aria-expanded', String(isOpen));
        });

        var links = nav.querySelectorAll('a');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function() {
                nav.classList.remove('active');
                btn.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
            });
        }

        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !btn.contains(e.target)) {
                nav.classList.remove('active');
                btn.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ── Topic Tabs ───────────────────────────────────────
    function initTabs() {
        var tabs = document.querySelectorAll('.topic-tab');
        var contents = document.querySelectorAll('.topic-content');
        if (tabs.length === 0) return;

        for (var i = 0; i < tabs.length; i++) {
            tabs[i].addEventListener('click', function() {
                var targetId = this.getAttribute('data-tab');

                for (var j = 0; j < tabs.length; j++) {
                    tabs[j].classList.remove('active');
                    tabs[j].setAttribute('aria-selected', 'false');
                }
                for (var k = 0; k < contents.length; k++) {
                    contents[k].classList.remove('active');
                }

                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');

                var target = document.getElementById(targetId);
                if (target) {
                    target.classList.add('active');
                }
            });
        }
    }

    // ── Smooth Scrolling ─────────────────────────────────
    function initSmoothScroll() {
        var anchors = document.querySelectorAll('a[href^="#"]');
        for (var i = 0; i < anchors.length; i++) {
            anchors[i].addEventListener('click', function(e) {
                var href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    var header = document.querySelector('.header');
                    var offset = header ? header.offsetHeight : 80;
                    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            });
        }
    }

    // ── Header Scroll Effect ─────────────────────────────
    function initHeaderScroll() {
        var header = document.querySelector('.header');
        if (!header) return;

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // ── Init ─────────────────────────────────────────────
    function initAll() {
        initCountdown();
        initMobileMenu();
        initTabs();
        initSmoothScroll();
        initHeaderScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
