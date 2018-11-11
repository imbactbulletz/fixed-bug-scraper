process.setMaxListeners(Infinity);

const puppeteer = require('puppeteer');

// website related attributes
var browser = undefined;
var currentPage = undefined;

// window and viewport size
const width = 1600;
const height = 900;

/**
 * Prepares the browser for connection.
 */
async function init(){
        // launches browser with a GUI in specified dimensions
        browser = await puppeteer.launch({
            headless: false,
            args: [
                `--window-size=${width},${height}`
            ]
        });
    
    
         // opens a new browser 'tab'
         const page = await browser.newPage();
    
         // sets page dimensions
         await page.setViewport({
             width: width,
             height: height
           });


       currentPage = page;    
}


/**
 * Connects the browser to a given URL.
 */
module.exports.goto = async function goto(websiteURL){

    // Initializes the browser if it already isn't initialized
    if(browser == null){
        await init();
    }
    
    // goes to URL and waits until the DOM is fully populated
    await currentPage.goto(websiteURL, {
        waitUntil: 'networkidle2'
    });
};


/**
 * Logs onto the forum with given credentials.
 */
module.exports.login = async function login(user){

    await currentPage.waitForSelector('#sign_in');

    // selector showed up in DOM
    if(await currentPage.$('#sign_in') !== null){
        await currentPage.click('#sign_in');

        // wait for form to become visible
        await currentPage.waitForSelector('#login', {visible: true});

        // check if form is visible
        if(await currentPage.$('#login') != null){
            
           // type in credentials
           await currentPage.type("#ips_username", user.username);
           await currentPage.type("#ips_password", user.password);
        
            // sign in anonymously
            await currentPage.click('#inline_invisible')

            // press Enter to login
            await currentPage.keyboard.press('Enter');
            
            // wait to be logged in
            await currentPage.waitForNavigation({ waitUntil: 'networkidle2' })
        }
    }

    else {
        // selector didn't show up
        console.log('Nope. Sign in button isn\'t present here. :(');
    }

}

/**
 * Scrapes the fixed bugs from "Fixed-bugs" thread.
 */
module.exports.scrapeFixedBugs = async function scrapeFixedBugs(){
    // saving the current page so that it can be used to navigate by clicing 'next' button
    var currentPageURL = currentPage.url();
    // thread links that are contained in the subforum
    var topicLinks = await getTopicLinks();

    // visit each thread and scrape data from it
    for(i=0; i<topicLinks.length; i++){
        var topicLink = topicLinks[i];

        var topicData = await getTopicData(topicLink);
        console.log(topicData);
    }
}


/**
 * Gets the links of the threads that are located in one page of a subforum.
 */
async function getTopicLinks(){
    // performs a function that makes an array of elements that are contained in a table and are links, at the same time
    let topicLinks = await currentPage.evaluate(function(){
        return Array.from(document.querySelectorAll(' table tr td h4  a[href^="https://forum.gamer-district.org/topic/"]'))
        .map(function(val){
            return val.href;
        });
    });

    return topicLinks;
}

async function getTopicData(topicURL){
    var topicData = {};

    await currentPage.goto(topicURL, {waitUntil: 'networkidle2'});

    let topicPosts = await currentPage.evaluate(function(){
        // return Array.from(document.querySelectorAll('.post_wrap')).map((val) => val.innerHTML);
        return Array.from(document.querySelectorAll('.post_wrap h3 '));
    });

    // extracting the main post
    var mainPost = topicPosts[0];

    var x = await mainPost.querySelector('.post_username');
    console.log(x);


    await currentPage.waitFor(10000);
    return topicData;
}