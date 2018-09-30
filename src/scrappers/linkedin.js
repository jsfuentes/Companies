const
  puppeteer = require('puppeteer'),
  utils = require('../utils.js');

const LINKEDIN_BASE_URL = "https://www.linkedin.com/"

module.exports = class Linkedin {
  constructor(company, secrets) {
    this.company = company;
    this.LINKEDIN_SALARY_URL = LINKEDIN_BASE_URL + "salary/software-engineer-salaries-in-san-francisco-bay-area-at-" + company;
    this.LINKEDIN_COMPANY_URL = LINKEDIN_BASE_URL + "company/" + company + "/";
    this.data = {};
    this.cookie = secrets['cookie'];
  }

  async scrollPage() {
    await this.page.evaluate(_ => {
      window.scrollBy(0, window.innerHeight);
    });
  }

  async scrape() {
    await this.setup();
    await this.salary();
    await utils.randomDelay();
    await this.companyInfo();

    await utils.randomDelay();
    this.browser.close();
    return this.data;
  }

  async setup() {
    this.browser = await puppeteer.launch({headless: false});
    this.page = await this.browser.newPage()
    //not sure if this works actually...
    await this.page.on('console', msg => {
      for (let i = 0; i < msg.args.length; ++i)
        console.log(`${i}: ${msg.args[i]}`);
    });

    await this.page.setCookie({
      name: this.cookie['name'],
      value: this.cookie['value'],
      "url": "https://www.linkedin.com"});
  }

  async companyInfo() {
    await this.page.goto(this.LINKEDIN_COMPANY_URL);

    const foundingS = '.org-about-company-module__founded';
    await this.page.waitForSelector(foundingS);
    this.data['founding_year'] = await this.page.$eval(foundingS, x => x.innerText.trim());
    const headquartersS = '.org-about-company-module__headquarters';
    this.data['headquarters'] = await this.page.$eval(headquartersS, x => x.innerText.trim());

    utils.randomDelay();
    await this.scrollPage();

    //Employees
    await this.page.waitForSelector('.org-function-growth-table');
    this.data['employees'] = await this.page.evaluate(() => {
      const nodes = document.querySelectorAll('.Sans-17px-black-85\\\%-semibold');
      const employees = {
        'total': nodes[0].innerText.trim(),
        '6m_growth': nodes[1].children[0].innerText.trim(),
        '1y_growth': nodes[2].children[0].innerText.trim(),
        '2y_growth': nodes[3].children[0].innerText.trim(),
      };

      return employees;
    });

    this.data['employees']['type'] = await this.page.evaluate(() => {
      table = document.querySelector('.org-function-growth-table').children[0]; //get visibly hidden table
      rows = table.querySelectorAll('tr');

      let firstElement = true;
      let data = {};
      rows.forEach((row) => {
        if(firstElement) { //dont get first junk element
          firstElement = false;
          return;
        }

        const cols = row.querySelectorAll('td');
        const type = cols[0].innerText.trim();
        const count = cols[1].innerText.trim();
        const percent = cols[2].innerText.trim();
        data[type] = { count, percent };
      });

      return data;
    });

    this.data['employees']['avg_tenure'] = await this.page.evaluate(() => {
      return document.querySelector('.org-insights-module__facts').querySelector('strong').innerText;
    });
  }

  async salary() {
    await this.page.goto(this.LINKEDIN_SALARY_URL);

    const filterS = '#yxFilter';
    await this.page.waitForSelector(filterS);
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
