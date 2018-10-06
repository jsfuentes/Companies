const
  conf = require('./config.js'),
  Jscrape = require('./scrape.js'),
  utils = require('./utils.js');

//allow you to add and remove from config on demand, so need to keep old fails and remove current wins 
function getNewFails(oldFails, newWins) {
  newFails = [];
  for (let i = 0; i < oldFails.length; i++) {
    const fail = Object.keys(oldFails[i])[0];
    let isFail = true;
    for (let j = 0; j < newWins.length; j++) {
      const win = Object.keys(newWins[j])[0];
      if(win == fail) {
        isFail = false;
      }
    }
    if(isFail) {
      newFails.push(fail);
    }
  }
  
  return newFails;
}

async function redoScrape() {
  const secrets = await utils.readSecrets(); //TODO: Make example.json off secrets.json
  const dbData = await utils.connectToData(secrets);

  const companyDocs = await dbData.find({company: "medium"}).toArray();
  for(let i = 0; i < companyDocs.length; i++) {
    const company = companyDocs[i];
    const name = company.company;
    const oldFails = company.fails;
    console.log(name);
    
    try {
      const jscrape = new Jscrape(name, false, secrets);
      console.log("oldFails", Object.keys(oldFails));
      const data = await jscrape.getCompanyInfo(Object.keys(oldFails));  
    } catch (err) {
      console.log("Failed to scrape", company, "with", err);
    }

    
    //fails from data is correct, need to update wins though 
    const newWins = {
      ...data["wins"],
      ...company["wins"]
    };
    const newFails = getNewFails(oldFails, data["wins"]);
    console.log("wins", data["wins"], "newFails", newFails);
    
    const query = {"company": name};
    await dbData.update(query, {$set: data});
  }
      // try {
      //   const jscrape = new Jscrape(company, headless, secrets);
      //   const data = await jscrape.getCompanyInfo();
      //   await dbData.insertOne(data);
      // } catch (err) {
      // }
      // 
      // await utils.randomDelay();
      // await utils.randomDelay();

}

redoScrape();


