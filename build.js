/**
 * AIVTA 2026 - Static Site Builder
 * Zero-dependency Node.js script that assembles pages from templates + JSON data.
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');

// ── Load Data ──────────────────────────────────────────────
const siteData = JSON.parse(fs.readFileSync('data/site.json', 'utf8'));
const datesData = JSON.parse(fs.readFileSync('data/dates.json', 'utf8'));
const topicsData = JSON.parse(fs.readFileSync('data/topics.json', 'utf8'));
const navData = JSON.parse(fs.readFileSync('data/navigation.json', 'utf8'));
const committeeData = JSON.parse(fs.readFileSync('data/committee.json', 'utf8'));

// ── Helpers ────────────────────────────────────────────────
function loadPartial(name) {
  return fs.readFileSync(path.join('src', 'partials', name + '.html'), 'utf8');
}

function loadPage(name) {
  return fs.readFileSync(path.join('src', 'pages', name + '.html'), 'utf8');
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Render Functions ───────────────────────────────────────

function renderNavLinks(activePageId) {
  return navData.main.map(link => {
    const active = link.id === activePageId ? ' class="active"' : '';
    return `<a href="${link.href}"${active} data-en="${esc(link.labelEn)}" data-zh="${esc(link.labelZh)}">${link.labelEn}</a>`;
  }).join('\n                    ');
}

function renderFooterLinks(type) {
  const ids = type === 'quick' ? navData.footerQuickLinks : navData.footerInfoLinks;
  return ids.map(id => {
    const link = navData.main.find(l => l.id === id);
    if (!link) return '';
    return `                        <a href="${link.href}" data-en="${esc(link.labelEn)}" data-zh="${esc(link.labelZh)}">${link.labelEn}</a>`;
  }).join('\n');
}

function renderDates(dateIds) {
  const entries = dateIds.map(id => datesData.entries.find(e => e.id === id.trim())).filter(Boolean);
  return entries.map(e => `
                    <div class="date-card">
                        <h4 data-en="${esc(e.labelEn)}" data-zh="${esc(e.labelZh)}">${e.labelEn}</h4>
                        <p class="date" data-en="${esc(e.dateEn)}" data-zh="${esc(e.dateZh)}">${e.dateEn}</p>
                    </div>`).join('');
}

function renderDatesTable(dateIds) {
  const entries = dateIds.map(id => datesData.entries.find(e => e.id === id.trim())).filter(Boolean);
  return entries.map(e => `
                            <tr>
                                <td data-en="${esc(e.labelEn)}" data-zh="${esc(e.labelZh)}">${e.labelEn}</td>
                                <td data-en="${esc(e.dateEn)}" data-zh="${esc(e.dateZh)}">${e.dateEn}</td>
                            </tr>`).join('');
}

function renderDateInline(dateId) {
  const entry = datesData.entries.find(e => e.id === dateId.trim());
  if (!entry) return '';
  return `<span data-en="${esc(entry.dateEn)}" data-zh="${esc(entry.dateZh)}">${entry.dateEn}</span>`;
}

function renderTopics(layout) {
  if (layout === 'grid') {
    return topicsData.map(t => `
                    <div class="topic-card">
                        <div class="topic-card-icon">${t.icon}</div>
                        <h4 data-en="${esc(t.shortEn)}" data-zh="${esc(t.shortZh)}">${t.shortEn}</h4>
                        <p data-en="${esc(t.descEn)}" data-zh="${esc(t.descZh)}">${t.descEn}</p>
                    </div>`).join('');
  }
  if (layout === 'compact') {
    return topicsData.map(t => `
                    <div class="topic-card">
                        <h4 data-en="${esc(t.trackEn)}" data-zh="${esc(t.trackZh)}">${t.trackEn}</h4>
                        <p data-en="${esc(t.titleEn)}" data-zh="${esc(t.titleZh)}">${t.titleEn}</p>
                    </div>`).join('');
  }
  if (layout === 'tabs') {
    const tabs = topicsData.map(t =>
      `<button class="topic-tab${t === topicsData[0] ? ' active' : ''}" data-tab="${t.id}" data-en="${esc(t.tabEn)}" data-zh="${esc(t.tabZh)}">${t.tabEn}</button>`
    ).join('\n                        ');
    const contents = topicsData.map(t => {
      const active = t === topicsData[0] ? ' active' : '';
      const lis = t.subtopicsEn.map((en, i) =>
        `<li data-en="${esc(en)}" data-zh="${esc(t.subtopicsZh[i])}">${en}</li>`
      ).join('\n                        ');
      return `
                <div id="${t.id}" class="topic-content${active}">
                    <h3 data-en="${esc('Track ' + (topicsData.indexOf(t) + 1) + ': ' + t.titleEn)}" data-zh="${esc('主题' + (topicsData.indexOf(t) + 1) + '：' + t.titleZh)}">${'Track ' + (topicsData.indexOf(t) + 1) + ': ' + t.titleEn}</h3>
                    <ul class="topic-list">
                        ${lis}
                    </ul>
                </div>`;
    }).join('');
    return tabs + '\n' + contents;
  }
  return '';
}

function renderTopicGrid() {
  return topicsData.map((t, i) => {
    const n = i + 1;
    return `
                    <div class="topic-card">
                        <h4 data-en="${esc('Track ' + n + ': ' + t.tabEn)}" data-zh="${esc('方向' + n + '：' + t.tabZh)}">Track ${n}: ${t.tabEn}</h4>
                        <p data-en="${esc(t.titleEn)}" data-zh="${esc(t.titleZh)}">${t.titleEn}</p>
                    </div>`;
  }).join('');
}

function renderCommittee() {
  let html = '';
  const backgrounds = ['section', 'section section-light'];
  committeeData.sections.forEach((sec, i) => {
    const bg = backgrounds[i % 2];
    html += `
        <!-- ${sec.titleEn} -->
        <section class="${bg}">
            <div class="container">
                <div class="committee-category">
                    <h3 data-en="${esc(sec.titleEn)}" data-zh="${esc(sec.titleZh)}">${sec.titleEn}</h3>
                    <div class="committee-grid">`;
    sec.members.forEach(m => {
      html += `
                        <div class="committee-card">
                            <div class="committee-avatar" data-en="${esc(m.avatarEn || m.avatar)}" data-zh="${esc(m.avatarZh || m.avatar)}">${esc(m.avatarEn || m.avatar)}</div>
                            <div class="committee-info">
                                <h4 data-en="${esc(m.nameEn || m.name)}" data-zh="${esc(m.nameZh || m.name)}">${m.link ? `<a href="${esc(m.link)}" target="_blank" rel="noopener">${esc(m.nameEn || m.name)}</a>` : esc(m.nameEn || m.name)}</h4>
                                <p class="committee-role" data-en="${esc(m.roleEn)}" data-zh="${esc(m.roleZh)}">${m.roleEn}</p>`;
      if (m.affiliationEn) {
        html += `
                                <p class="committee-affiliation" data-en="${esc(m.affiliationEn)}" data-zh="${esc(m.affiliationZh)}">${m.affiliationEn}</p>`;
      }
      if (m.email) {
        html += `
                                <p class="committee-email">Email: ${esc(m.email)}</p>`;
      }
      html += `
                            </div>
                        </div>`;
    });
    html += `
                    </div>
                </div>
            </div>
        </section>`;
  });

  // Update note
  html += `

        <!-- Update Note -->
        <section class="section section-light">
            <div class="container">
                <div class="alert alert-info mt-4">
                    <p data-en="${esc(committeeData.updateNoteEn)}" data-zh="${esc(committeeData.updateNoteZh)}">${committeeData.updateNoteEn}</p>
                </div>
            </div>
        </section>`;

  // Organizers
  html += `

        <!-- Organizers -->
        <section class="section">
            <div class="container">
                <div class="committee-category">
                    <h3 data-en="${esc(committeeData.organizers.titleEn)}" data-zh="${esc(committeeData.organizers.titleZh)}">${committeeData.organizers.titleEn}</h3>

                    <div class="submission-info">
                        <h4 data-en="${esc(committeeData.organizers.hostTitleEn)}" data-zh="${esc(committeeData.organizers.hostTitleZh)}">${committeeData.organizers.hostTitleEn}</h4>
                        <ul class="requirements-list">`;
  committeeData.organizers.hosts.forEach(h => {
    html += `
                            <li>
                                <strong data-en="${esc(h.nameEn)}" data-zh="${esc(h.nameZh)}">${h.nameEn}</strong><br>
                                <span data-en="Address: ${esc(h.addressEn)}" data-zh="地址：${esc(h.addressZh)}">Address: ${h.addressEn}</span>
                            </li>`;
  });
  html += `
                        </ul>
                    </div>

                    <div class="submission-info">
                        <h4 data-en="${esc(committeeData.organizers.coHostTitleEn)}" data-zh="${esc(committeeData.organizers.coHostTitleZh)}">${committeeData.organizers.coHostTitleEn}</h4>
                        <ul class="requirements-list">`;
  committeeData.organizers.coOrganizers.forEach(co => {
    html += `
                            <li>
                                <strong data-en="${esc(co.nameEn)}" data-zh="${esc(co.nameZh)}">${co.nameEn}</strong><br>
                                <span data-en="Address: ${esc(co.addressEn)}" data-zh="地址：${esc(co.addressZh)}">Address: ${co.addressEn}</span>
                            </li>`;
  });
  html += `
                        </ul>
                    </div>
                </div>
            </div>
        </section>`;

  // Keynote speakers
  const ks = committeeData.keynoteSection;
  html += `

        <!-- Keynote Speakers -->
        <section class="section section-light">
            <div class="container">
                <div class="committee-category">
                    <h3 data-en="${esc(ks.titleEn)}" data-zh="${esc(ks.titleZh)}">${ks.titleEn}</h3>

                    <div class="alert alert-info">
                        <p data-en="${esc(ks.announcementEn)}" data-zh="${esc(ks.announcementZh)}">${ks.announcementEn}</p>
                    </div>

                    <p data-en="${esc(ks.expectedLabelEn)}" data-zh="${esc(ks.expectedLabelZh)}">${ks.expectedLabelEn}</p>
                    <ul>`;
  ks.backgroundsEn.forEach((bg, i) => {
    html += `
                        <li data-en="${esc(bg)}" data-zh="${esc(ks.backgroundsZh[i])}">${bg}</li>`;
  });
  html += `
                    </ul>
                </div>
            </div>
        </section>`;

  return html;
}

// ── Build Config ───────────────────────────────────────────

const pages = [
  {
    file: 'index.html',
    template: 'index',
    pageId: 'index',
    titleEn: 'AIVTA 2026 - International Conference on AI Video Technology and Applications',
    titleZh: 'AIVTA 2026 - AI视频技术及其应用国际会议',
    metaDesc: 'AIVTA 2026 - International Conference on AI Video Technology and Applications. November 13-15, 2026, Hefei, China.',
  },
  {
    file: 'committee.html',
    template: 'committee',
    pageId: 'committee',
    titleEn: 'Committee - AIVTA 2026',
    titleZh: '组织委员会 - AIVTA 2026',
    metaDesc: 'AIVTA 2026 Conference Committee - Organizing Committee, Program Committee, and Advisory Board',
  },
  {
    file: 'call-for-papers.html',
    template: 'call-for-papers',
    pageId: 'call-for-papers',
    titleEn: 'Call for Papers - AIVTA 2026',
    titleZh: '征稿启事 - AIVTA 2026',
    metaDesc: 'AIVTA 2026 Call for Papers - Submit your research on AI Video Technology and Applications',
  },
  {
    file: 'submission.html',
    template: 'submission',
    pageId: 'submission',
    titleEn: 'Submission Guidelines - AIVTA 2026',
    titleZh: '投稿指南 - AIVTA 2026',
    metaDesc: 'AIVTA 2026 Paper Submission Guidelines - Requirements, format, and submission process',
  },
  {
    file: 'registration.html',
    template: 'registration',
    pageId: 'registration',
    titleEn: 'Registration - AIVTA 2026',
    titleZh: '注册 - AIVTA 2026',
    metaDesc: 'AIVTA 2026 Conference Registration - Fees, deadlines, and registration information',
  },
  {
    file: 'publication.html',
    template: 'publication',
    pageId: 'publication',
    titleEn: 'Publication - AIVTA 2026',
    titleZh: '出版 - AIVTA 2026',
    metaDesc: 'AIVTA 2026 Publication Information - IEEE Conference Proceedings, EI Compendex and Scopus indexing',
  },
  {
    file: 'program.html',
    template: 'program',
    pageId: 'program',
    titleEn: 'Program - AIVTA 2026',
    titleZh: '会议日程 - AIVTA 2026',
    metaDesc: 'AIVTA 2026 Conference Program - Schedule, keynotes, and technical sessions',
  },
  {
    file: 'contact.html',
    template: 'contact',
    pageId: 'contact',
    titleEn: 'Contact - AIVTA 2026',
    titleZh: '联系我们 - AIVTA 2026',
    metaDesc: 'Contact AIVTA 2026 - Venue information, organizing committee contacts, and inquiries',
  },
];

// ── Build ──────────────────────────────────────────────────

function buildPage(config) {
  // Read the page content template
  let content;
  try {
    content = loadPage(config.template);
  } catch (e) {
    console.error(`Missing template: src/pages/${config.template}.html`);
    process.exit(1);
  }

  // Resolve all template placeholders in content
  content = content
    .replace(/\{\{DATES:([\w,-]+)\}\}/g, (_, ids) => renderDates(ids.split(',')))
    .replace(/\{\{DATES_TABLE:([\w,-]+)\}\}/g, (_, ids) => renderDatesTable(ids.split(',')))
    .replace(/\{\{DATE:([\w-]+)\}\}/g, (_, id) => renderDateInline(id))
    .replace(/\{\{TOPICS:(grid|tabs|compact)\}\}/g, (_, layout) => renderTopics(layout))
    .replace(/\{\{TOPIC_GRID\}\}/g, () => renderTopicGrid())
    .replace(/\{\{COMMITTEE\}\}/g, () => renderCommittee());

  // Assemble partials
  const head = loadPartial('head')
    .replace(/\{\{PAGE_TITLE_EN\}\}/g, esc(config.titleEn))
    .replace(/\{\{PAGE_TITLE_ZH\}\}/g, esc(config.titleZh))
    .replace(/\{\{META_DESC\}\}/g, esc(config.metaDesc));

  const header = loadPartial('header')
    .replace('{{NAV_LINKS}}', renderNavLinks(config.pageId));

  const footer = loadPartial('footer')
    .replace('{{FOOTER_QUICK_LINKS}}', renderFooterLinks('quick'))
    .replace('{{FOOTER_INFO_LINKS}}', renderFooterLinks('info'));

  const embedData = JSON.stringify({
    conferenceDate: siteData.conferenceDate,
    page: config.pageId,
  }).replace(/</g, '\\u003c');

  const scripts = loadPartial('scripts')
    .replace('{{EMBED_DATA}}', embedData);

  // Assemble final page
  const page = head + '\n<body>\n' + header + '\n\n<main id="main-content">\n' + content + '\n</main>\n\n' + footer + '\n' + scripts + '\n</body>\n</html>\n';

  fs.writeFileSync(config.file, page, 'utf8');
  console.log('  Built: ' + config.file);
}

// ── Main ───────────────────────────────────────────────────

console.log('Building AIVTA 2026 website...\n');
pages.forEach(buildPage);
console.log('\nDone. ' + pages.length + ' pages built.');
