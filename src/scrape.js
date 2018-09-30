const
  Linkedin = require('./scrappers/linkedin.js'),
  MongoClient = require('mongodb').MongoClient,
  utils = require('./utils.js');

const COMPANY_LIST = [
  "Facebook",
  "Google",
  "Coursera",
  "Aurora",
  "Udacity",
  "Stripe",
  "Medium",
  "Affirm",
  "Social Capital",
  "Airbnb",
  "rubrik",
  "databricks",
  "plaid",
  "Quora",
  "Cruise",
  "Two Sigma",
  "Dropbox",
  "Slack",
  "lemonade",
  "Robinhood"
]

async function connectToCollection(secrets) {
  const db = await MongoClient.connect(secrets['db_uri'], { useNewUrlParser: true });

  const dbo = db.db("companies");
  return dbo.collection("data");
}

async function getCompanyInfo(company, secrets) {
  const linkedin = new Linkedin(company, secrets['linkedin']);
  const linkedinData = await linkedin.scrape();


  var data = {
    "company": company,
    ...linkedinData
  };

  console.log(data);
  return data;
}

async function main() {
  const secrets = await utils.readSecrets(); //TODO: Make example.json off secrets.json
  const dbData = await connectToCollection(secrets);

  data = await getCompanyInfo("quora", secrets);
  await dbData.insertOne(data);
}

main();
