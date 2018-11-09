const puppeteer = require('puppeteer');

// website related attributes
var browser = undefined;
var currentPage = undefined;

// window and viewport size
const width = 1600;
const height = 900;


// Prepares the browser for connection.
async function init(){
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


// Connects to a given URL.
module.exports.connect = async function connect(websiteURL){

    // Initializes the browser if it already isn't initialized
    if(browser == null){
        await init();
    }
    
    // goes to URL and waits until the DOM is fully populated
    await currentPage.goto(websiteURL, {
        waitUntil: 'domcontentloaded'
    });
};


// Logs onto the page with given credentials.
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
        
            // press Enter to login
            await currentPage.keyboard.press('Enter');
        }
    }

    else {
        // selector didn't show up
        console.log('Nope. Sign in button isn\'t present here. :(');
    }


    //await currentPage.waitFor(5000);
    await browser.close();
}
