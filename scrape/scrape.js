const
  conf = require('./config.js'),
  Crunchbase = require('./scrappers/crunchbase.js'),
  Glassdoor = require('./scrappers/glassdoor.js'),
  k = require('./constants.js'),
  LinkedinSalary = require('./scrappers/linkedinSalary.js'),
  LinkedinCompany = require('./scrappers/linkedinCompany.js'),
  StackShare = require('./scrappers/stackshare.js'),
  utils = require('./utils.js');
  
SCRAPPERS = [
  [k.LINKEDIN_COMPANY, LinkedinCompany],
  [k.LINKEDIN_SALARY, LinkedinSalary],
  [k.CRUNCHBASE, Crunchbase],
  [k.STACKSHARE, StackShare],
  [k.GLASSDOOR, Glassdoor], 
];

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
    for(let i = 0; i < SCRAPPERS.length; i++) {
      let scrapeDef = SCRAPPERS[i];
      let scrapeKey = scrapeDef[0];
      let scrapeClass = scrapeDef[1];
      
      //TODO: Find a way to do this in parallel with promises
      if(toScrape[0] = k.SCRAPE_ALL || toScrape.indexOf(scrapeKey) != -1) {
        await this.scrape(scrapeKey, scrapeClass);
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
  async scrape(scrapeKey, scrapeClass) {
    const scrapper = new scrapeClass(this.company, this.headless, this.secrets[scrapeKey]);
    try {
      let data = await scrapper.scrape();
      this.wins.push(scrapeKey);
      this.allInfo = {
        ...this.allInfo,
        ...data
      }
    } catch (err) {
      console.log("Error scrapping", scrapeKey, ":", err);
      this.fails.push(scrapeKey);
      await scrapper.close();
    }
  }
  
}
