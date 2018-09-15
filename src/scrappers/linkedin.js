const
  puppeteer = require('puppeteer'),
  MongoClient = require('mongodb').MongoClient,
  utils = require('../utils.js');

module.exports = class Linkedin {
  constructor(company, secrets) {
    this.company = company;
    this.LINKEDIN_BASE_URL = "https://www.linkedin.com/"
    this.LINKEDIN_SALARY_URL = this.LINKEDIN_BASE_URL + "salary/software-engineer-salaries-in-san-francisco-bay-area-at-" + company;
    this.data = {};
    this.cookie = secrets['linkedin']['cookie'];
  }

  async scrape() {
    this.browser = await puppeteer.launch({headless: false});

    await this.login();
    await this.salary();

    await utils.delay(3000);
    this.browser.close();
  }

  async login() {
    this.page = await this.browser.newPage()
    //not sure if this works actually...
    this.page.on('console', msg => {
      for (let i = 0; i < msg.args.length; ++i)
        console.log(`${i}: ${msg.args[i]}`);
    });

    this.page.setCookie({
      name: this.cookie['name'],
      value: this.cookie['value'],
      "url": "https://www.linkedin.com"});
  }

  async salary() {
    this.page = await this.browser.newPage()

    await this.page.goto(this.LINKEDIN_SALARY_URL);

    const filterS = '#yxFilter';
    await this.page.waitForSelector(filterS);
    await utils.randomDelay();
    await this.page.select(filterS, '0-0'); //select less than 1 year

    const baseS = '.median-amount';
    await this.page.waitForSelector(baseS);
    this.data['base'] = await this.page.$eval(baseS, x => x.innerText);

    this.data['extras'] = await this.page.evaluate(() => {
      names = document.querySelectorAll('.addc-CellContent__name');
      extras = document.querySelectorAll('.addc-CellContent__median__amount');
      var data = {};
      for (var i = 0; i < names.length; i++) {
        data[names[i].innerText] = extras[i].innerText
      }
      return data;
    });
  }
}
