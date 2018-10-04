// const
//   Linkedin = require('./scrappers/linkedin.js'),
//   StackShare = require('./scrappers/stackshare.js'),
//   Crunchbase = require('./scrappers/crunchbase.js'),
//   Glassdoor = require('./scrappers/glassdoor.js'),
//   con = require('./constants.js')
//   utils = require('./utils.js');
// 
// async function main() {
//   let linkedinCompanyData = linkedinSalaryData = stackData = fundingData = ratingData = {};
//   let fails = {"fails": []};
// 
//   const linkedin = new Linkedin(company, secrets['linkedin'], headless);
//   try {
//     linkedinCompanyData = await linkedin.scrape(false, true);
//   } catch(err) {
//     console.log("Error scrapping Linkedin Company:", err);
//     fails['fails'].push(k.LINKEDIN_COMPANY);
//     await linkedin.close();
//   }
// 
//   try {
//     linkedinSalaryData = await linkedin.scrape(true, false);
//   } catch(err) {
//     console.log("Error scrapping Linkedin Salary:", err);
//     fails['fails'].push(k.LINKEDIN_SALARY);
//     await linkedin.close();
//   }
// 
//   const stack = new StackShare(company, headless);
//   try {
//     stackData = await stack.scrape();
//   } catch(err) {
//     console.log("Error scrapping StackShare:", err);
//     fails['fails'].push(k.STACKSHARE);
//     await stack.close();
//   }
// 
//   const crunchbase = new Crunchbase(company, headless);
//   try {
//     fundingData = await crunchbase.scrape();
//   } catch(err) {
//     console.log("Error scrapping Crunchbase:", err);
//     fails['fails'].push(k.CRUNCHBASE);
//     await crunchbase.close();
//   }
// 
//   const glassdoor = new Glassdoor(company, secrets['glassdoor'], headless);
//   try {
//     ratingData = await glassdoor.scrape();
//    } catch(err) {
//     console.log("Error scrapping Glassdoor:", err);
//     fails['fails'].push(k.GLASSDOOR);
//     await glassdoor.close();
//   }
// }

try {
  throw "err";
} catch