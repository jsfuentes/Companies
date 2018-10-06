const
  utils = require('./utils.js');

function addDateToDoc(d) {
  var date = new Date();

  backupD = {
    ...d,
    date: date.toDateString(),
  }
  return backupD;
}

async function backup() {
  const secrets = await utils.readSecrets();
  const dbData = await utils.connectToData(secrets);
  const dbBackup = await utils.connectToBackup(secrets);
  
  let companyDoc = await dbData.find().toArray();
  companyDoc.forEach((d) => {
    dbBackup.insertOne(addDateToDoc(d));
  });
  
  console.log("Backup complete");
}

backup();