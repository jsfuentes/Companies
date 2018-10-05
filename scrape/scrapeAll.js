const
  conf = require('./config.js'),
  Jscrape = require('./scrape.js'),
  utils = require('./utils.js');

async function main(headless=true) {
  const secrets = await utils.readSecrets(); //TODO: Make example.json off secrets.json
  const dbData = await utils.connectToData(secrets);

  for (var i = 0; i < conf.COMPANY_LIST.length; i++) {
    company = conf.COMPANY_LIST[i];
    console.log("Scraping", company);

    var companyDocs = await dbData.find({"company": company}).toArray();
    if(companyDocs.length == 0) {
      try {
        const jscrape = new Jscrape(company, headless, secrets);
        const data = await jscrape.getCompanyInfo();
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
