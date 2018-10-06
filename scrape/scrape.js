const
  conf = require('./config.js'),
  k = require('./constants.js'),
  utils = require('./utils.js');
  
//TODO: Scrape owler too, get muse links, get crunchbase link too
module.exports = class Jscrape {
  constructor(company, headless, secrets) {
    this.fails = [];
    this.wins = [];
    this.company = company;
    this.headless = headless;
    this.secrets = secrets;
    this.allInfo = {};
  }
  
  async getCompanyInfo(toScrape=[k.SCRAPE_ALL]) {
    for(let i = 0; i < conf.SCRAPPERS.length; i++) {
      let scrapeDef = conf.SCRAPPERS[i];
      let scrapeKey = scrapeDef[0];
      let scrapeClass = scrapeDef[1];
      let scrapeVersion = scrapeDef[2];
      
      //TODO: Find a way to do this in parallel with promises
      if(toScrape[0] = k.SCRAPE_ALL || toScrape.indexOf(scrapeKey) != -1) {
        await this.scrape(scrapeKey, scrapeClass, scrapeVersion);
      }
    }
    
    this.allInfo = {
      "company": company,
      "fails": this.fails,
      "wins": this.wins,
      ...this.allInfo 
    }
    
    console.log(this.allInfo);
    return this.allInfo;
  }
  
  //collects wins, fails, and info 
  async scrape(scrapeKey, scrapeClass, scrapeVersion) {
    const scrapper = new scrapeClass(this.company, this.headless, this.secrets[scrapeKey]);
    const scrapeInfo = {};
    scrapeInfo[scrapeKey] = scrapeVersion; // record version and name 
    try {
      let data = await scrapper.scrape();
      this.wins.push(scrapeInfo);
      this.allInfo = {
        ...this.allInfo,
        ...data
      }
    } catch (err) {
      console.log("Error scrapping", scrapeKey, ":", err);
      this.fails.push(scrapeInfo);
      await scrapper.close();
    }
  }
  
}
