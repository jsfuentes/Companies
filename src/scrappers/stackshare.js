const
  puppeteer = require('puppeteer'),
  utils = require('../utils.js');

module.exports = class StackShare {
  constructor(company) {
    this.company = company;
    this.BASE_URL = "https://stackshare.io/"
    this.COMPANY_URL = this.BASE_URL + company + "/" + company;
    this.data = {};
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

  async scrape() {
    await this.setup();
    await this.getStack();

    await utils.randomDelay();
    this.browser.close();
    return this.data;
  }

  async getStack() {
    await this.page.goto(this.COMPANY_URL);

    await this.page.waitForSelector('.full-stack-container');
    this.data["stack"] = await this.page.evaluate(() => {
      let data = {};
      const catDivs = document.querySelectorAll('div.stack-layer');
      for (let i = 0; i < catDivs.length; i++) {
        const catDiv = catDivs[i];
        const type = catDiv.querySelector('.stack-layer-title').children[0].innerText;
        const techs = catDiv.querySelectorAll('a.stack-service-name-under');
        for (let j = 0; j < techs.length; j++) {
          const tech = techs[j].innerText;
          if (type in data) {
            data[type].push(tech);
          } else {
            data[type] = [tech];
          }
        }
      }

      return data;
    });
  }
}