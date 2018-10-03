const
  Linkedin = require('./scrappers/linkedin.js'),
  StackShare = require('./scrappers/stackshare.js'),
  Crunchbase = require('./scrappers/crunchbase.js'),
  Glassdoor = require('./scrappers/glassdoor.js'),
  utils = require('./utils.js');

const COMPANY_TOO_SMALL = [
  "aurora",
];

const COMPANY_LIST = [
  "facebook",
  "coursera",
  "google",
  "udacity",
  "stripe",
  "medium",
  "affirm",
  // "Social Capital",
  "airbnb",
  "rubrik",
  "databricks",
  "plaid",
  "quora",
  "cruise",
  "two-sigma-investments",
  "lyft",
  "uber",
  "box",
  "dropbox",
  "slack",
  "lemonade",
  "robinhood",
  "palantir-technologies",
  "amazon",
  "apple",
  "microsoft",
  "snap",
  "pinterest",
  "linkedin",
  "twitter",
  "paypal",
  "square",
  "docker",
  "asana",
];

async function getCompanyInfo(company, secrets, headless) {
  let linkedinCompanyData = linkedinSalaryData = stackData = fundingData = ratingData = {};
  let fails = {"fails": []};

  //TODO: Add seperate fts for salary and company Info for seperate fails
  const linkedin = new Linkedin(company, secrets['linkedin'], headless);
  try {
    linkedinSalaryData = await linkedin.scrape(true, false);
  } catch(err) {
    console.log("Error scrapping Linkedin Salary:", err);
    fails['fails'].push("Linkedin Salary");
    await linkedin.close();
  }

  try {
    linkedinCompanyData = await linkedin.scrape(false, true);
  } catch(err) {
    console.log("Error scrapping Linkedin Company:", err);
    fails['fails'].push("Linkedin Company");
    await linkedin.close();
  }

  const stack = new StackShare(company, headless);
  try {
    stackData = await stack.scrape();
  } catch(err) {
    console.log("Error scrapping StackShare:", err);
    fails['fails'].push("StackShare");
    await stack.close();
  }

  const crunchbase = new Crunchbase(company, headless);
  try {
    fundingData = await crunchbase.scrape();
  } catch(err) {
    console.log("Error scrapping Crunchbase:", err);
    fails['fails'].push("Crunchbase");
    await crunchbase.close();
  }

  const glassdoor = new Glassdoor(company, secrets['glassdoor'], headless);
  try {
    ratingData = await glassdoor.scrape();
   } catch(err) {
    console.log("Error scrapping Glassdoor:", err);
    fails['fails'].push("Glassdoor");
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

async function main(headless=true) {
  const secrets = await utils.readSecrets(); //TODO: Make example.json off secrets.json
  const dbData = await utils.connectToData(secrets);

  for (var i = 0; i < COMPANY_LIST.length; i++) {
    company = COMPANY_LIST[i];
    console.log("Scraping", company);

    var companyDoc = await dbData.find({"company": company}).toArray();
    if(companyDoc.length == 0) {
      try {
        const data = await getCompanyInfo(company, secrets, headless);
        await dbData.insertOne(data);
      } catch (err) {
        console.log("Failed to scrape", company, "with", err);
      }

      await utils.randomDelay();
      await utils.randomDelay();
    }
  }

}

main(false);
