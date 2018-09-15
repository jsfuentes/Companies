const
  fs = require('fs'),
  util = require('util');


function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

function randomDelay() {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.floor(Math.random() * 4000));
  });
}

async function readSecrets() {
  // Convert fs.readFile into Promise version of same
  const readFile = util.promisify(fs.readFile);
  const data = await readFile('secrets.json');
  return JSON.parse(data);
}

module.exports = {delay, randomDelay, readSecrets};
