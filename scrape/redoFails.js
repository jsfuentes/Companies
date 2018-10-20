const
  conf = require('./config.js'),
  Jscrape = require('./scrape.js'),
  utils = require('./utils.js');

//allow you to add and remove from config on demand, so need to keep old fails and remove current wins 
function getNewFails(oldFails, newWins) {
  newFails = {};
  for (var fail in oldFails) {
   if (oldFails.hasOwnProperty(fail)) {
     if(!(fail in newWins)) {
       newFails[fail] = oldFails[fail];
     }
   } 
  }
  
  return newFails;
}

async function redoScrape() {
  const secrets = await utils.readSecrets(); 
  const dbData = await utils.connectToData(secrets);

  const companyDocs = await dbData.find({company: "medium"}).toArray();
  for(let i = 0; i < companyDocs.length; i++) {
    const oldData = companyDocs[i];
    const name = oldData.company;
    const oldFails = oldData.fails;
    console.log(name);
    
    try {
      const jscrape = new Jscrape(name, false, secrets);
      console.log("oldFails", Object.keys(oldFails));
      const data = await jscrape.getCompanyInfo(Object.keys(oldFails));  
    } catch (err) {
      console.log("Failed to scrape", name, "with", err);
    }
    
    const newWins = {
      ...data["wins"],
      ...oldData["wins"]
    };
    const newFails = getNewFails(oldFails, newWins);
    console.log("wins", data["wins"], "newFails", newFails);
    
    const query = {"company": name};
    await dbData.update(query, {$set: data});
  }

}

redoScrape();


