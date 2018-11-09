// dependencies
var site_functions = require('./functions.js');
const performance = require('perf_hooks').performance;
var t0;
var t1;

    // variables related to the forum
    var siteURL =  "https://forum.gamer-district.org";
    var user = {'username': 'exideoz', 'password': 'venividiscrape'};


    // the main function of the program
    async function main() {
        var t0 = performance.now();
        // sets up a browser and connects to a given URL
        await site_functions.connect(siteURL);

        // logs into the forum with given acreditives
        await site_functions.login(user);

        t1 = performance.now();
        console.log((t1-t0)/1000);
    }



    // calls main to start
    main();