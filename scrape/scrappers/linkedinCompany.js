const
  puppeteer = require('puppeteer'),
  Scrapper = require('./base.js'),
  utils = require('../utils.js');

const LINKEDIN_BASE_URL = "https://www.linkedin.com/";

module.exports = class LinkedinCompany extends Scrapper {
  constructor(company, headless, secrets) {
    super(company, headless, secrets);
    this.LINKEDIN_SEARCH_URL = LINKEDIN_BASE_URL + "search/results/companies/v2/?keywords=" + company + "&origin=SWITCH_SEARCH_VERTICAL";
    this.data = {};
  }

  async scrape() {
    await this.setup();
    await this.page.setCookie({
      name: this.secrets.cookie['name'],
      value: this.secrets.cookie['value'],
      url: LINKEDIN_BASE_URL});
      
    await this.companyInfo();
    await utils.randomDelay();

    await this.close();
    return this.data;
  }

  async companyInfo() {
    await this.page.goto(this.LINKEDIN_SEARCH_URL);

    const companyResultS = '.search-result__title';
    await this.page.waitForSelector(companyResultS);
    await utils.randomDelay();
    await this.page.click(companyResultS);
    
    const descriptionS = '.org-about-us-organization-description__text';
    await this.page.waitForSelector(descriptionS);
    this.data['description'] = await this.page.$eval(descriptionS, x => x.innerText.trim());
    this.data['linkedin_url'] = this.page.url();

    const foundingS = '.org-about-company-module__founded';
    try {
      this.data['founding_year'] = await this.page.$eval(foundingS, x => x.innerText.trim());
    } catch(_) {}
    const websiteS = '.org-about-company-module__company-page-url'; 
    try {
      this.data['website'] = await this.page.$eval(websiteS, x => x.innerText.trim());
    } catch(_) {}
    const headquartersS = '.org-about-company-module__headquarters';
    try {
      this.data['headquarters'] = await this.page.$eval(headquartersS, x => x.innerText.trim());
    } catch(_) {}
    
    await utils.randomDelay();
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
    
    return;
  }
  
}
