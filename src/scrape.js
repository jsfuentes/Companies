const
  Linkedin = require('./scrappers/linkedin.js'),
  StackShare = require('./scrappers/stackshare.js'),
  Crunchbase = require('./scrappers/crunchbase.js'),
  Glassdoor = require('./scrappers/glassdoor.js'),
  MongoClient = require('mongodb').MongoClient,
  utils = require('./utils.js');

const COMPANY_TOO_SMALL = [
  "aurora",
]

const COMPANY_LIST = [
  "facebook",
  "coursera",
  "google",
  "udacity",
  "stripe",
  "medium",
  // "affirm",
  // // "Social Capital",
  // "airbnb",
  // "rubrik",
  // "databricks",
  // "plaid",
  // "quora",
  // "cruise",
  // // "Two Sigma",
  // "dropbox",
  // "slack",
  // "lemonade",
  // "robinhood"
]

async function connectToCollection(secrets) {
  const db = await MongoClient.connect(secrets['db_uri'], { useNewUrlParser: true });

  const dbo = db.db("companies");
  return dbo.collection("data");
}

async function getCompanyInfo(company, secrets) {
  let linkedinData = stackData = fundingData = ratingData = {};
  let fails = {"fails": []};
  
  //TODO: Add seperate fts for salary and company Info for seperate fails
  const linkedin = new Linkedin(company, secrets['linkedin']);
  try {
    linkedinData = await linkedin.scrape();
  } catch(err) {
    console.log("Error scrapping Linkedin:", err);
    fails['fails'].push("Linkedin");
    await linkedin.setDown();
  }


  const stack = new StackShare(company);
  try {
    stackData = await stack.scrape();
  } catch(err) {
    console.log("Error scrapping StackShare:", err);
    fails['fails'].push("StackShare");
    await stack.setDown();
  }

  const crunchbase = new Crunchbase(company);
  try {
    fundingData = await crunchbase.scrape();
  } catch(err) {
    console.log("Error scrapping Crunchbase:", err);
    fails['fails'].push("Crunchbase");
    await crunchbase.setDown();
  }

  const glassdoor = new Glassdoor(company, secrets['glassdoor']);
  try {
    ratingData = await glassdoor.scrape();
   } catch(err) {
    console.log("Error scrapping Glassdoor:", err);
    fails['fails'].push("Glassdoor");
    await glassdoor.setDown();
  }

  var data = {
    "company": company,
    ...fails,
    ...linkedinData,
    ...stackData,
    ...fundingData,
    ...ratingData
  };

  console.log(data);
  return data;
}

async function main() {
  const secrets = await utils.readSecrets(); //TODO: Make example.json off secrets.json
  const dbData = await connectToCollection(secrets);

  for (var i = 0; i < COMPANY_LIST.length; i++) {
    company = COMPANY_LIST[i];
    console.log("Scraping", company);

    var companyDoc = await dbData.find({"company": company}).toArray();
    if(companyDoc.length == 0) {
      try {
        const data = await getCompanyInfo(company, secrets);
        await dbData.insertOne(data);
      } catch (err) {
        console.log("Failed to scrape", company, "with", err);
      }

      await utils.randomDelay();
      await utils.randomDelay();
    }
  }

}

main();
