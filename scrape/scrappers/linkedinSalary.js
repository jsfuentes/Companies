const
  puppeteer = require('puppeteer'),
  Scrapper = require('./base.js'),
  utils = require('../utils.js');

const LINKEDIN_BASE_URL = "https://www.linkedin.com/"

module.exports = class LinkedinSalary extends Scrapper {
  constructor(company, headless, secrets) {
    super(company, headless, secrets);
    this.LINKEDIN_SALARY_URL = LINKEDIN_BASE_URL + "salary/software-engineer-salaries-in-san-francisco-bay-area-at-" + company;
    this.data = {};
  }

  async scrape() {
    await this.setup();
    await this.page.setCookie({
      name: this.secrets.cookie['name'],
      value: this.secrets.cookie['value'],
      url: LINKEDIN_BASE_URL});
      
    await this.salary();
    await utils.randomDelay();

    await this.close();
    return this.data;
  }
  
  //TODO: Detect headquarters and if in New York check salary there
  async salary() {
    await this.page.goto(this.LINKEDIN_SALARY_URL);

    const filterS = '#yxFilter';
    await this.page.waitForSelector(filterS);
    
    const companyLogo = '.cohortCard__companyLogo';
    try {
      await this.page.waitForSelector(companyLogo);
    } catch(err) {
      throw new Error("Linkedin Salary in the Bay doesn't have the salary");
    }
    this.data['logo'] = await this.page.$eval(companyLogo, x => x.src);
      
    await utils.randomDelay();
    await this.page.select(filterS, '0-0'); //select less than 1 year

    const baseS = '.median-amount';
    await this.page.waitForSelector(baseS);
    const base = await this.page.$eval(baseS, x => x.innerText.trim());

    const extras = await this.page.evaluate(() => {
      names = document.querySelectorAll('.addc-CellContent__name');
      extras = document.querySelectorAll('.addc-CellContent__median__amount');
      let data = {};
      for (let i = 0; i < names.length; i++) {
        data[names[i].innerText.trim()] = extras[i].innerText.trim();
      }
      return data;
    });

    this.data['comp'] = {
      ['base']: base,
      ...extras
    }
  }
}
