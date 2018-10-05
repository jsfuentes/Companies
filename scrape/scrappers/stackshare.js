const
  puppeteer = require('puppeteer'),
  Scrapper = require('./base.js'),
  utils = require('../utils.js');

//TODO: Notice cant find page
module.exports = class StackShare extends Scrapper {
  constructor(company, headless) {
    super(company, headless);
    this.BASE_URL = "https://stackshare.io/"
    this.COMPANY_URL = this.BASE_URL + company + "/" + company;
    this.data = {};
  }

  async scrape() {
    await this.setup();
    await this.getStack();

    await utils.randomDelay();
    await this.close();
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
