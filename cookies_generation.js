const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const puppeteer = require('puppeteer');

async function run(){
	http.createServer(async function (req, res) {
		const buffer = await downloadImages(req.url);
		await res.writeHead(200, {"Content-Type": "text/plain"});
		await res.end("Cookie generated.");
	}).listen(8889);
}

function delay(time) {
   return new Promise(function(resolve) { 
       setTimeout(resolve, time)
   });
}

async function downloadImages(params) {
	if (!params) return 0;
	let url = params.slice(6);
	try {
		const browser = await puppeteer.launch({
            executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            headless: false,
        });
		const page = await browser.newPage();
        const fs = require('fs').promises;
        // Load Cookies
        const cookiesString = await fs.readFile('cookies.json');
        await page.setCookie(...JSON.parse(cookiesString));
        
        await page.goto(String(url), {   
            waitUntil: 'networkidle0'
        });
//         # Save cookies
        while (1) {
            await delay(1000);
            if(!page.isClosed()) {
                const cookies = await page.cookies();
                await fs.writeFile('cookies.json', JSON.stringify(cookies, null, 2));
            }
            else{
                break;
            }
        }
        
		await browser.close();
	} catch (err) {
		console.log(err);
	}

}

run();
