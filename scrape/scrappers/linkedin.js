const
  puppeteer = require('puppeteer'),
  utils = require('../utils.js');

const LINKEDIN_BASE_URL = "https://www.linkedin.com/"

module.exports = class Linkedin {
  constructor(company, secrets, headless) {
    this.company = company;
    this.LINKEDIN_SALARY_URL = LINKEDIN_BASE_URL + "salary/software-engineer-salaries-in-san-francisco-bay-area-at-" + company;
    this.LINKEDIN_SEARCH_URL = LINKEDIN_BASE_URL + "search/results/companies/v2/?keywords=" + company + "&origin=SWITCH_SEARCH_VERTICAL";
    this.data = {};
    this.cookie = secrets['cookie'];
    this.headless = headless;
  }

  async scrollPage() {
    await this.page.evaluate(_ => {
      window.scrollBy({left: 0, top: window.innerHeight, behavior: 'smooth'});
    });
  }

  async scrape(salary=true, company=true) {
    await this.setup();
    if(salary) {
      await this.salary();
      await utils.randomDelay();
    }

    if(company) {
      await this.companyInfo();
      await utils.randomDelay();
    }

    await this.close();
    return this.data;
  }

  async setup() {
    this.browser = await puppeteer.launch({headless: this.headless});
    this.page = await this.browser.newPage()
    //not sure if this works actually...
    await this.page.on('console', msg => {
      for (let i = 0; i < msg.args.length; ++i)
        console.log(`${i}: ${msg.args[i]}`);
    });

    await this.page.setCookie({
      name: this.cookie['name'],
      value: this.cookie['value'],
      "url": LINKEDIN_BASE_URL});
  }

  async close() {
    await this.browser.close();
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

  //TODO: Detect reroute cuz company doesnt exist, rn scrapes basic SF data
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
