const
  conf = require('./config.js'),
  utils = require('./utils.js'),
  k = require('./constants.js'),
  jscrape = require('./scrape.js');

///////////////////////
//EDIT updateDoc to determine how to update
//////////////////////
function updateDoc(d) {
  let newWins = {};
  let newFails = {};
  d.fails.forEach((f) => {
    const key = Object.keys(f)[0];
    const v = f[key];
    newFails[key] = v;
  });
  
  d.wins.forEach((w) => {
    const key = Object.keys(w)[0];
    const v = w[key];
    newWins[key] = v;
  });
  
  
  return  {"wins" : newWins, "fails": newFails };
}

async function testBackfill(company) {
  const secrets = await utils.readSecrets();
  const dbData = await utils.connectToData(secrets);
  
  const query = {company: company};
  let companyDoc = await dbData.find(query).toArray();
  companyDoc.forEach((d) => {
    const newDoc = updateDoc(d);
    dbData.updateOne(query, {$set: newDoc});
  });
  
  console.log("Backfill of", company, "complete");
}

async function backfillAll() {
  const secrets = await utils.readSecrets();
  const dbData = await utils.connectToData(secrets);
  // const dbSanitizedData = await utils.connectToSanitizedData(secrets);
  
  let companyDoc = await dbData.find().toArray();
  companyDoc.forEach((d) => {
    const query = {company: d['company']};
    const newDoc = updateDoc(d);
    dbData.updateOne(query, {$set: newDoc});
  });
  
  console.log("Backfill All complete");
}

// testBackfill('medium');
backfillAll();