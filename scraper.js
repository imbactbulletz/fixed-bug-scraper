process.setMaxListeners(Infinity);

const puppeteer = require('puppeteer');
const mySQLConnector = require('./mysql_connector.js');

// website related attributes
var browser = undefined;
var currentPage = undefined;

// window and viewport size
const width = 1600;
const height = 900;

let ctr = 0;
/**
 * Prepares the browser for connection.
 */
async function init() {
    // launches browser with a GUI in specified dimensions
    browser = await puppeteer.launch({
        headless: true,
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
module.exports.goto = async function goto(websiteURL) {

    // Initializes the browser if it already isn't initialized
    if (browser == null) {
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
module.exports.login = async function login(user) {

    await currentPage.waitForSelector('#sign_in');

    // selector showed up in DOM
    if (await currentPage.$('#sign_in') !== null) {
        await currentPage.click('#sign_in');

        // wait for form to become visible
        await currentPage.waitForSelector('#login', {visible: true});

        // check if form is visible
        if (await currentPage.$('#login') != null) {

            // type in credentials
            await currentPage.type("#ips_username", user.username);
            await currentPage.type("#ips_password", user.password);

            // sign in anonymously
            await currentPage.click('#inline_invisible')

            // press Enter to login
            await currentPage.keyboard.press('Enter');

            // wait to be logged in
            await currentPage.waitForNavigation({waitUntil: 'networkidle2'})
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
module.exports.scrapeFixedBugs = async function scrapeFixedBugs() {
    console.log("Scraping page: " + ++ctr + "..");
    // saving the current page so that it can be used to navigate by clicing 'next' button
    var currentPageURL = await currentPage.url();
    // thread links that are contained in the subforum

    var threadLinks = await getThreadLinks();

    // visit each thread and scrape data from it
    for (let i = 0; i < await threadLinks.length; i++) {
        var threadLink = threadLinks[i];

        var threadData = await getThreadData(threadLink);
        //console.log(threadData);

        mySQLConnector.insertBugReport(threadData);
    }

    await currentPage.goto(currentPageURL, {waitUntil: 'networkidle2'});

    if(await currentPage.$('a[rel="next"]')){
        currentPage.click('a[rel="next"]');
        await currentPage.waitForNavigation({waitUntil: 'domcontentloaded'});
        await this.scrapeFixedBugs();
    } else {
        return 1;
    }

};


/**
 * Gets the links of the threads that are located in one page of a subforum.
 */
async function getThreadLinks() {
    // performs a function that makes an array of elements that are contained in a table and are links, at the same time
    let threadLinks = await currentPage.evaluate(function () {
        return Array.from(document.querySelectorAll(' table tr td h4  a[href^="https://forum.gamer-district.org/topic/"]'))
            .map(function (val) {
                return val.href;
            });
    });

    return threadLinks;
}

/**
 * Scrapes all the posts contained in a thread
 * @param threadURL - thread URL
 * @returns {Promise<void>} - dictionary which contains the original topic and a list of replies.
 */
async function getThreadData(threadURL) {

    await currentPage.goto(threadURL, {waitUntil: 'domcontentloaded'});

    let threadData = await currentPage.evaluate(function () {
        // all posts have a wrapper div with class "post_wrap" that
        let threadPosts = document.querySelectorAll('.post_wrap ');

        // this is the object that will be returned
        let threadData = {
            topic: {},
            replies: []
        };

        // all post-related data will be stored in this object
        let postData;

        // iterating through each post of the thread
        for (let i = 0; i < threadPosts.length; i++) {
            postData = {};

            // gets the post's title from the page
            let postTitle = document.querySelector('.ipsType_pagetitle').innerText;
            postData.title = postTitle;

            // gets post at i-th position in the thread
            let post = threadPosts[i];

            // gets the author's name
            postData.postedBy = post.querySelector('.post_username').innerText;


            // get date posted
            let datePosted_str = post.querySelector('abbr.published ').title;
            postData.postedOn = datePosted_str.split('T')[0];

            // gets content of the post as a HTML Element
            let content = post.querySelector('div.post.entry-content');
            // to text
            let content_str = content.innerText;

            // appending the links contained in <a href> to the end of the content
            content_str += "\nLinks:";

            //get links in the post
            let links = content.querySelectorAll("a[href]");

            // append each link's text and URL to the content
            for (j = 0; j < links.length; j++) {
                content_str += "\n" + links[j].innerText + ": " + links[j].href;
            }

            // sets post's content
            postData.content = content_str;


            // if it's a first post in the thread then it's a topic,
            if (i == 0) {
                threadData.topic = postData;
            } else {
                // otherwise, it's a reply to the topic
                threadData.replies.push(postData);
            }


        }

        return threadData;
    });

    return threadData;
}