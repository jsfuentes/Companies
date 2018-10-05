const
  conf = require('./config.js'),
  jscrape = require('./scrape.js'),
  utils = require('./utils.js');

async function main(headless=true) {
  const secrets = await utils.readSecrets(); //TODO: Make example.json off secrets.json
  const dbData = await utils.connectToData(secrets);

  for (var i = 0; i < conf.COMPANY_LIST.length; i++) {
    company = conf.COMPANY_LIST[i];
    console.log("Scraping", company);

    var companyDoc = await dbData.find({"company": company}).toArray();
    if(companyDoc.length == 0) {
      try {
        const data = await jscrape.getCompanyInfo(company, headless, secrets);
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
