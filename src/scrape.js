const
  Linkedin = require('./scrappers/linkedin.js'),
  StackShare = require('./scrappers/stackshare.js'),
  Crunchbase = require('./scrappers/crunchbase.js'),
  MongoClient = require('mongodb').MongoClient,
  utils = require('./utils.js');

const COMPANY_LIST = [
  "facebook",
  "google",
  "coursera",
  // "Aurora",
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
  // "Two Sigma",
  "dropbox",
  "slack",
  "lemonade",
  "robinhood"
]

async function connectToCollection(secrets) {
  const db = await MongoClient.connect(secrets['db_uri'], { useNewUrlParser: true });

  const dbo = db.db("companies");
  return dbo.collection("data");
}

async function getCompanyInfo(company, secrets) {
  const linkedin = new Linkedin(company, secrets['linkedin']);
  const linkedinData = await linkedin.scrape();

  const stack = new StackShare(company);
  const stackData = await stack.scrape();

  const crunchbase = new Crunchbase(company);
  const fundingData = await crunchbase.scrape();

  var data = {
    "company": company,
    ...linkedinData,
    "stack": stackData,
    "funding": fundingData,
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
      await utils.randomDelay();
      await utils.randomDelay();
    }
  }

}

main();
