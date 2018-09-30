const
  puppeteer = require('puppeteer'),
  utils = require('../utils.js');

const BASE_URL = "https://www.glassdoor.com/";

module.exports = class Glassdoor {
  constructor(company, secrets) {
    this.company = company;
    this.data= {'glassdoor_rating': {}};
    this.secrets = secrets
  }

  async setup() {
    this.browser = await puppeteer.launch({headless: false});
    this.page = await this.browser.newPage();
    //not sure if this works actually...
    await this.page.on('console', msg => {
      for (let i = 0; i < msg.args.length; ++i)
        console.log(`${i}: ${msg.args[i]}`);
    });
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
    await this.page.type(usernameS, this.secrets['username']);

    await utils.randomDelay();
    const passwordS = '#LoginModal > div > div > div.signInModal.modalContents > div.signin > div:nth-child(4) > div.emailSignInForm > form > div:nth-child(4) > div > input';
    await this.page.type(passwordS, this.secrets['password']);

    await utils.randomDelay();
    const loginButtonS = '#LoginModal > div > div > div.signInModal.modalContents > div.signin > div:nth-child(4) > div.emailSignInForm > form > button';
    await this.page.click(loginButtonS);
  }

  async scrape() {
    await this.setup();
    await this.getToReviewPage();
    await this.login();
    await this.getRatings();

    await utils.randomDelay();
    this.browser.close();
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
    await this.page.type(searchS, this.company);

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

    await utils.randomDelay();
    //click filter arrow down
    const filterArrow = '#MainCol > div.module.filterableContents > div.eiFilter > div.noPadLt > div.hideHH.curFilters > span.gdSelect.margRtSm > p > span.arrowDown';
    await this.page.click(filterArrow);

    await utils.randomDelay();
    await this.page.type('#FilterJobTitle', 'software');

    //unselect part-time to only have fulltime
    await utils.randomDelay();
    const parttimeOption = '#OccLocFilters > div.eiFilterForm.margTop > form > div:nth-child(1) > div:nth-child(3) > div > div > ul > li:nth-child(5)';
    await this.page.click(parttimeOption);

    await utils.randomDelay();
    const filterButton = '#FilterButtons > div.ib.applyBtn > button';
    await this.page.click(filterButton);

    await this.page.waitForSelector('.ratingNum');
    this.data['glassdoor_rating']['software'] = await this.page.evaluate(() => document.querySelector('.ratingNum').innerText);
  }
}
