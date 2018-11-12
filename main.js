// dependencies
var scraper = require('./scraper.js');
var mySQLConnector = require('./mysql_connector.js');

const performance = require('perf_hooks').performance;
var t0;
var t1;

    // variables related to the forum
    var siteURL =  "https://forum.gamer-district.org";
    var user = {'username': 'exideoz', 'password': 'venividiscrape'};
    var fixedBugsURL = "https://forum.gamer-district.org/forum/124-fixed-bugs/";

    // the main function of the program
    async function main() {
        var t0 = performance.now();
        // sets up a browser and connects to a given URL
        await scraper.goto(siteURL);

        // logs into the forum with given acreditives
        await scraper.login(user).then(function(){});

        // go to fixed bugs thread
        await scraper.goto(fixedBugsURL);

        let mySQLConnection = mySQLConnector.connect('localhost', 'gamer_district', 'root', '');


        await scraper.scrapeFixedBugs(mySQLConnection);

        // scrape the fixed bugs

        t1 = performance.now();
        console.log((t1-t0)/1000);
    }



    // calls main to start
    main();