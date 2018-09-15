const
  Linkedin = require('./scrappers/linkedin.js'),
  utils = require('./utils.js');

async function main() {
  const secrets = await utils.readSecrets();

  const linkedin = new Linkedin("quora", secrets);
  linkedin.scrape();
}

main();
