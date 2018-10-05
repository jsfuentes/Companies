const
  conf = require('./config.js'),
  Crunchbase = require('./scrappers/crunchbase.js'),
  Glassdoor = require('./scrappers/glassdoor.js'),
  k = require('./constants.js'),
  Linkedin = require('./scrappers/linkedin.js'),
  StackShare = require('./scrappers/stackshare.js'),
  utils = require('./utils.js');
  
SCRAPPERS = [
  Crunchbase, 
  Glassdoor, 
  Linkedin,
  StackShare,
]

class Jscrape {
  constructor(company, headless, secrets, toScrape=["All"]) {
    this.fails = {fails: []};
    this.wins = {wins: []);
    this.company = company;
    this.headless = headless;
    this.secrets = secrets;
    this.toScrape = toScrape;
  }
  
  
}

//TODO: Scrape owler too, get muse links, get crunchbase link too
async function getCompanyInfo(company, headless, secrets) {
  let linkedinCompanyData = linkedinSalaryData = stackData = fundingData = ratingData = {};
  let fails = {"fails": []};

  const linkedin = new Linkedin(company, headless, secrets['linkedin']);
  try {
    linkedinCompanyData = await linkedin.scrape(false, true);
  } catch(err) {
    console.log("Error scrapping Linkedin Company:", err);
    fails['fails'].push(k.LINKEDIN_COMPANY);
    await linkedin.close();
  }

  try {
    linkedinSalaryData = await linkedin.scrape(true, false);
  } catch(err) {
    console.log("Error scrapping Linkedin Salary:", err);
    fails['fails'].push(k.LINKEDIN_SALARY);
    await linkedin.close();
  }

  const stack = new StackShare(company, headless);
  try {
    stackData = await stack.scrape();
  } catch(err) {
    console.log("Error scrapping StackShare:", err);
    fails['fails'].push(k.STACKSHARE);
    await stack.close();
  }

  const crunchbase = new Crunchbase(company, headless);
  try {
    fundingData = await crunchbase.scrape();
  } catch(err) {
    console.log("Error scrapping Crunchbase:", err);
    fails['fails'].push(k.CRUNCHBASE);
    await crunchbase.close();
  }

  const glassdoor = new Glassdoor(company, headless, secrets['glassdoor']);
  try {
    ratingData = await glassdoor.scrape();
   } catch(err) {
    console.log("Error scrapping Glassdoor:", err);
    fails['fails'].push(k.GLASSDOOR);
    await glassdoor.close();
  }

  var data = {
    "company": company,
    ...fails,
    ...linkedinCompanyData,
    ...linkedinSalaryData,
    ...stackData,
    ...fundingData,
    ...ratingData
  };

  console.log(data);
  return data;
}

module.exports = {getCompanyInfo};
