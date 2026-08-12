import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('Navigated to Home');
    
    // Click on a collection link
    await page.click('a[href="/collection"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {});
    console.log('Navigated to Collection');

    await browser.close();
  } catch (err) {
    console.error('Puppeteer Script Error:', err);
  }
})();
