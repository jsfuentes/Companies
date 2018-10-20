const
  utils = require('./utils.js'),
  conf = require('./config.js');

function weighSalary(key, amount) {
  if(key == 'Sign-on bonus') {
    amount = amount / conf.TENURE;
  } else {
    amount *= conf.TENURE;
  }

  if(key == 'Sign-on bonus' || key == 'Annual bonus') {
    amount *= conf.BONUS_MULTIPLER;
  }

  return amount/conf.TENURE;
}

async function main() {
  const secrets = await utils.readSecrets();
  dataDB = await utils.connectToData(secrets);
  betterDB = await utils.connectToSanitizedData(secrets);

  let myList = [];
  dataDB.find({}).forEach((e) => {
    let total = 0;
    if ('comp' in e) {
      for (var key in e['comp']) {
        if (e['comp'].hasOwnProperty(key)) {
            let curAmount = utils.moneyToNumber(e['comp'][key]);
            curAmount = weighSalary(key, curAmount);
            total += curAmount;
            e['comp'][key] = curAmount;
        }
      }
      total = Math.round(total/1000)*1000;
      e['comp']['total'] = total;
      let engStats = {count: 0, percent: 0};
      try {
        engStats =  e['employees']['type']['Engineering'];
      } catch (err) {
        engStats = {count: 0, percent: 0};
      }
      console.log(e['company'], total, engStats['count'], engStats['percent']);
    }
  });
}

main();
