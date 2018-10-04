const
  puppeteer = require('puppeteer'),
  utils = require('../utils.js');

const BASE_URL = "https://www.glassdoor.com/";

//TODO: Scrape Glassdoor way better adding mission and url 
module.exports = class Glassdoor {
  constructor(company, secrets, headless) {
    this.company = company;
    this.data= {'glassdoor_rating': {}};
    this.secrets = secrets;
    this.headless = headless;
  }

  async setup() {
    this.browser = await puppeteer.launch({headless: this.headless});
    this.page = await this.browser.newPage();
    //not sure if this works actually...
    await this.page.on('console', msg => {
      for (let i = 0; i < msg.args.length; ++i)
        console.log(`${i}: ${msg.args[i]}`);
    });
  }

  async close() {
    await this.browser.close();
  }

  //must be run on review page
  async login() {
    await utils.randomDelay();
    await this.page.waitForSelector('.ratingNum'); //must be run on review page cuz this
    await this.page.evaluate(() => {
      document.querySelector('a.sign-in').click();
    });

    await utils.randomDelay();
    const usernameS = "#LoginModal > div > div > div.signInModal.modalContents > div.signin > div:nth-child(4) > div.emailSignInForm > form > div:nth-child(3) > div > input";
    await this.page.waitForSelector(usernameS);
    await this.page.type(usernameS, this.secrets['username'], {delay: 90});

    await utils.randomDelay();
    const passwordS = '#LoginModal > div > div > div.signInModal.modalContents > div.signin > div:nth-child(4) > div.emailSignInForm > form > div:nth-child(4) > div > input';
    await this.page.type(passwordS, this.secrets['password'], {delay: 118});

    await utils.randomDelay();
    const loginButtonS = '#LoginModal > div > div > div.signInModal.modalContents > div.signin > div:nth-child(4) > div.emailSignInForm > form > button';
    await this.page.click(loginButtonS);
  }

  async scrape() {
    await this.setup();
    await this.getToReviewPage();
    await this.getRatings();

    await utils.randomDelay();
    await this.close();
    return this.data;
  }

  async getToReviewPage() {
    await this.page.goto(BASE_URL);

    const searchS ='#KeywordSearch';
    await this.page.waitForSelector(searchS);
    await this.page.evaluate(() => {
      const choices = document.querySelector('.context-choice-tabs-box');
      const companiesTab = choices.querySelectorAll('li')[1];
      companiesTab.click();
    });

    await utils.randomDelay();
    await this.page.type(searchS, this.company, {delay: 93});

    await utils.randomDelay();
    const searchButtonS ='#HeroSearchButton';
    await this.page.click(searchButtonS);

    await this.page.waitForNavigation();

    //For some reason, the search/company often opens in a new tab
    const pages = await this.browser.pages();
    this.page = pages[pages.length - 1]; //most recently opened

    //It can go straight to company page or to search, but either way the code works :0
    await utils.randomDelay();
    //Choose the first review box to click, in search will be the first search result
    await this.page.evaluate(() => {
      document.querySelector('a.eiCell.cell.reviews').click();
    });
  }

  async getRatings() {
    await this.page.waitForSelector('.ratingNum');
    this.data['glassdoor_rating']['total'] = await this.page.evaluate(() => document.querySelector('.ratingNum').innerText);

    //the login and filtering is pretty shaky
    try {
      await this.login();

      await utils.randomDelay();
      //click filter arrow down
      const filterArrow = '#MainCol > div.module.filterableContents > div.eiFilter > div.noPadLt > div.hideHH.curFilters > span.gdSelect.margRtSm > p > span.arrowDown';
      await this.page.click(filterArrow);

      await utils.randomDelay();
      await this.page.type('#FilterJobTitle', 'software', {delay: 105});

      await utils.randomDelay();
      const filterButton = '#FilterButtons > div.ib.applyBtn > button';
      await this.page.click(filterButton);

      await this.page.waitForSelector('.ratingNum');
      this.data['glassdoor_rating']['software'] = await this.page.evaluate(() => document.querySelector('.ratingNum').innerText);
    } catch(err) {
      console.log("NOT FATAL ERROR, but couldn't get engineer specific ratings:", err);
    }
  }

}
