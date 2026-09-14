const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('--- SIGNIN ---');
  await page.goto('https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com/signin');
  await page.waitForTimeout(2000);
  
  const signinInputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(el => ({ id: el.id, name: el.name, type: el.type, placeholder: el.placeholder }));
  });
  console.log('Inputs:', signinInputs);
  
  const signinButtons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(el => ({ id: el.id, text: el.innerText }));
  });
  console.log('Buttons:', signinButtons);
  
  const signinLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, p, div')).filter(el => ['Forgot Password', 'Forget Password ?', 'Continue as Guest', 'Sign Up'].includes(el.innerText)).map(el => ({ tag: el.tagName, text: el.innerText }));
  });
  console.log('Links/Text:', signinLinks);

  console.log('\n--- SIGNUP ---');
  await page.goto('https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com/signup');
  await page.waitForTimeout(2000);
  
  const signupInputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(el => ({ id: el.id, name: el.name, type: el.type, placeholder: el.placeholder }));
  });
  console.log('Inputs:', signupInputs);

  await browser.close();
})();
