const { chromium } = require('playwright');
const { copyFileSync } = require('fs');
const path = require('path');

const source = path.resolve(__dirname, 'AIVTA2026-微信宣传物料.html');
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chrome });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1440 }, deviceScaleFactor: 1 });
  await page.goto(`file://${source}`, { waitUntil: 'load' });
  await page.locator('#poster-benefits').screenshot({ path: path.resolve(__dirname, 'AIVTA2026-参会价值海报.png') });
  await page.locator('#poster-cfp').screenshot({ path: path.resolve(__dirname, 'AIVTA2026-征稿信息海报.png') });
  await page.locator('#poster-leaders').screenshot({ path: path.resolve(__dirname, 'AIVTA2026-专家阵容与主办单位.png') });
  await page.emulateMedia({ media: 'print' });
  const finalPdf = path.resolve(__dirname, '../output/pdf/AIVTA2026-会议征稿简章.pdf');
  await page.pdf({
    path: finalPdf,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  copyFileSync(finalPdf, path.resolve(__dirname, 'AIVTA2026-会议征稿简章.pdf'));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
