# Companies
A tool for investors to aggregate data from Crunchbase, Linkedin, Glassdoor, and Stackshare using an automated webscrapper. While the scrapper backend is complete as well as the Flask backend, the frontend is currently a work in progress.  

## Tech 
This is a work in progress tool for investors in tech companies. The core of the app is built in NodeJS and puppeteer with a MongoDB database. 

### Scrape Folder
The scrapper folder has all the scrappers that are derived from the base.js class and implement all the individual scrapping logic in a scrape method. The configuration file config.js offers the changable variables including the list of company names to scrape. The rest of the files in the main folder are for database management including backup.js, backfill.js, and sanitize.js. 

### Usage
The `node scrapeAll.js` will scrape every company from the config file putting the data in the database defined by the secret.json file. See the exampleSecrets.json to understand how to fill out the secrets file. You will need at least a mongodb uri. To access all the content, you will need a Linkedin premium account and a glassdoor account. If you don't have any of those, you can disable the corresponding scrappers in the config.js file by simply commenting them out. 


