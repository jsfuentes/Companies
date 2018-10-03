const
  fs = require('fs'),
  MongoClient = require('mongodb').MongoClient,
  util = require('util');


function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

function randomDelay() {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.floor(Math.random() * 4000) + 777);
  });
}

async function readSecrets() {
  // Convert fs.readFile into Promise version of same
  const readFile = util.promisify(fs.readFile);
  const data = await readFile('secrets.json');
  return JSON.parse(data);
}

async function connectToData(secrets) {
  const db = await MongoClient.connect(secrets['db_uri'], { useNewUrlParser: true });

  const dbo = db.db("companies");
  return dbo.collection("data");
}

async function connectToSanitizedData(secrets) {
  const db = await MongoClient.connect(secrets['db_uri'], { useNewUrlParser: true });

  const dbo = db.db("companies");
  return dbo.collection("sanitized_data");
}

function moneyToNumber(moneyStr) {
  return parseInt(moneyStr.replace(/[^0-9.-]+/g, ''));
}

module.exports = {delay, randomDelay, readSecrets, connectToData, connectToSanitizedData, moneyToNumber};
