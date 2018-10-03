const
  utils = require('./utils.js');

const TENURE = 1.5;
const BONUS_MULTIPLER = .9;
//assume two year average tenure and discount bonuses by .9 as taxed more / speculative
function weighSalary(key, amount) {
  if(key == 'Sign-on bonus') {
    amount = amount / TENURE;
  } else {
    amount *= TENURE;
  }

  if(key == 'Sign-on bonus' || key == 'Annual bonus') {
    amount *= BONUS_MULTIPLER;
  }

  return amount/TENURE;
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
      e['comp']['total'] = total;
      console.log(e['company'], total);
    }
  });
}

main();
