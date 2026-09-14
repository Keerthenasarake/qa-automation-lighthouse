const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com/signin');
  await page.waitForTimeout(3000); // Give it plenty of time to render
  
  const allTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*')).map(el => {
      const text = el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 ? el.childNodes[0].textContent.trim() : null;
      return { tag: el.tagName, text: text, id: el.id, class: el.className };
    }).filter(x => x.text);
  });
  
  console.log(JSON.stringify(allTexts.filter(x => 
    x.text.toLowerCase().includes('forget') || 
    x.text.toLowerCase().includes('forgot') || 
    x.text.toLowerCase().includes('guest') || 
    x.text.toLowerCase().includes('sign up')
  ), null, 2));

  await browser.close();
})();
