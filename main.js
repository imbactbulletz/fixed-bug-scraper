// dependencies
var scraper = require('./scraper.js');
var mySQLConnector = require('./mysql_connector.js');
var moment = require('moment');

const performance = require('perf_hooks').performance;
let t0;
let t1;

    // variables related to the forum
    var siteURL =  "https://forum.gamer-district.org";
    var user = {'username': 'exideoz', 'password': 'venividiscrape'};
    var fixedBugsURL = "https://forum.gamer-district.org/forum/124-fixed-bugs/";


    let getTime = (milli) => {
    let time = new Date(milli);
    let hours = time.getUTCHours();
    let minutes = time.getUTCMinutes();
    let seconds = time.getUTCSeconds();
    let milliseconds = time.getUTCMilliseconds();
    return hours + ":" + minutes + ":" + seconds + ":" + milliseconds;
};

    // the main function of the program
    async function main() {
        t0 = performance.now();
        // sets up a browser and connects to a given URL
        await scraper.goto(siteURL);

        // logs into the forum with given acreditives
        await scraper.login(user).then(function(){});

        // go to fixed bugs thread
        await scraper.goto(fixedBugsURL);

        mySQLConnector.connect('localhost', 'gamer_district', 'root', '');


        await scraper.scrapeFixedBugs();

        // scrape the fixed bugs

        t1 = performance.now();
        console.log((t1-t0)/1000);
        console.log("Finished scraping!");
        console.log("Time taken: " + moment.duration(t1-t0).humanize());

    }



    // calls main to start
    main();