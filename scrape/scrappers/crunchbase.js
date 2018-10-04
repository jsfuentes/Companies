const
  puppeteer = require('puppeteer'),
  utils = require('../utils.js');

//TODO: Handle when Crunchbase blocks you by saving the urls for later use 
//TODO: Notice can't find page
module.exports = class Crunchbase {
  constructor(company, headless) {
    this.company = company;
    this.COMPANY_URL = "https://www.crunchbase.com" + "/organization/" + company;
    this.data = {'funding': []};
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
    this.page.setDefaultNavigationTimeout(60000); //increase timeout to 1 minutes
  }

  async close() {
    await this.browser.close();
  }

  async scrape() {
    await this.setup();
    await this.page.goto(this.COMPANY_URL);

    const links = await this.getLinks();
    for (let i = 0; i < links.length; i++) {
      await this.scrapeValuation(links[i]);
    }

    await utils.randomDelay();
    await this.close();

    return this.data;
  }

  async getLinks() {
    await this.page.waitForSelector('.card-grid', {
                networkIdleTimeout: 5000,
                waitUntil: 'networkidle',
                timeout: 3000000
            });
    const links = await this.page.evaluate(() => {
      let links = [];
      const table = document.querySelectorAll('.card-grid')[0];
      const rows = table.querySelectorAll('tr.ng-star-inserted');
      for (let i = 0; i < rows.length; i++) {
        row = rows[i];
        const linkCol = row.querySelectorAll('td')[1];
        const link = linkCol.querySelector('a').getAttribute("href");
        links.push("https://www.crunchbase.com" + link);
      }
      return links;
    });

    return links;
  }

  async scrapeValuation(link) {
    await this.page.goto(link);
    await this.page.waitForSelector('.component--image-with-text-card');

    const curData = await this.page.evaluate(() => {
      const container = document.querySelector('#section-overview > mat-card > div.section-layout-content > fields-card > div');
      const labels = container.querySelectorAll('span.wrappable-label-with-info');
      const values = container.querySelectorAll('span.component--field-formatter'); //first value is picture so one less value than label

      let round = null;
      let date = null;
      let valuation = null;
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i].innerText.trim();
        if (label == "Pre-Money Valuation") {
          valuation = values[i-1].innerText.trim(); //company is the first one
        }
        if (label == "Announced Date") {
          date = values[i-1].innerText.trim();
        }
      }

      if(valuation !== null) {
        round = { date, valuation };
      }

      return round;
    });

    if(curData !== null) {
      this.data["funding"].push(curData);
    }
  }
}
