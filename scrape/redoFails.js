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

function combineData(oldData, data) {
  const oldFails = oldData.fails;
  const newWins = {
    ...data["wins"],
    ...oldData["wins"]
  };
  const newFails = getNewFails(oldFails, newWins);
  const newData = Object.assign(oldData, data, {"wins": newWins}, {"fails": newFails});//ones to the right override others
  return newData;
}

async function redoScrape() {
  const secrets = await utils.readSecrets(); 
  const dbData = await utils.connectToData(secrets);

  const companyDocs = await dbData.find().toArray();
  for(let i = 0; i < companyDocs.length; i++) {
    const oldData = companyDocs[i];
    const name = oldData.company;
    const oldFails = oldData.fails;
    console.log(name);
    
    let data = {};
    try {
      if(Object.keys(oldFails).length != 0) {
        const jscrape = new Jscrape(name, false, secrets);

        console.log("Redoing: ", Object.keys(oldFails));
        data = await jscrape.getCompanyInfo(Object.keys(oldFails));  
        const newData = combineData(oldData, data);
        
        const query = {"company": name};
        await dbData.updateOne(query, {$set: newData});
        console.log(newData);
      }
    } catch (err) {
      console.log("Failed to scrape", name, "with", err);
    }

  }

}

redoScrape();


