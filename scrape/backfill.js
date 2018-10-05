const
  conf = require('./config.js'),
  utils = require('./utils.js'),
  k = require('./constants.js'),
  jscrape = require('./scrape.js');

///////////////////////
//EDIT updateDoc to determine how to update
//////////////////////
function updateDoc(d) {
  let wins = [k.LINKEDIN_COMPANY, k.STACKSHARE, k.LINKEDIN_SALARY, k.GLASSDOOR, k.CRUNCHBASE];
  d.fails.forEach((f) => {
    let i = wins.indexOf(f);
    if (i != -1) {
      wins.splice(i, 1);
    }
  });
  
  return { $set : { "wins" : wins } };
}

async function backfill() {
  const secrets = await utils.readSecrets();
  const dbData = await utils.connectToData(secrets);
  // const dbSanitizedData = await utils.connectToSanitizedData(secrets);
  
  let companyDoc = await dbData.find().toArray();
  companyDoc.forEach((d) => {
    const query = {company: d['company']};
    
    dbData.updateOne(query, updateDoc(d));
  });
  
  console.log("Backfill complete");
}

backfill();