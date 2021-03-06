const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const puppeteer = require('puppeteer');
const crypto = require('crypto');

async function run(){
	http.createServer(async function (req, res) {
		const buffer = await downloadImages(req.url);
		await res.writeHead(200, {"Content-Type": "text/plain"});
		await res.end(buffer);
	}).listen(8889);
}

const download = (url, destination) => new Promise((resolve, reject) => {
	var buffer = true;
	try {
		const file = fs.createWriteStream(destination);

		https.get(url, response => {
			response.pipe(file);

			file.on('finish', () => {
				file.close(resolve(true));
			});
		}).on('error', error => {
			fs.unlink(destination);

			reject(error.message);
		});
	} catch (err) {
        console.log(err);
		buffer = false;
	}
	return buffer;
	
});

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
//             headless: false,
        });
		const page = await browser.newPage();
        // Load Cookies
        const fs = require('fs').promises;
        const cookiesString = await fs.readFile('cookies.json');
        await page.setCookie(...JSON.parse(cookiesString));
        
		
        await page.goto(String(url), {   
            waitUntil: 'networkidle0'
        });
        
		const images = await page.evaluate(() => Array.from(document.images, function(e) {
			try {
				if (e.width >= 300 && e.height >= 300) return e.src;
			} catch (err) {
				console.log(err);
			}
			return null;
		}));

        let result = "";
        let k = 0;
// 		for (let i = images.length-1; i >= 0; i--) {
        for (let i = 0; i < images.length; i++) {
			if (images[i]) {
                if(k > 1) {
                    await browser.close();
                    return result;
                }
                if(await download(images[i], "downloads/Facebook/" + crypto.createHash('md5').update(images[i]).digest('hex') + `.png`)) {
                    k += 1;
                    
                    result +=  " Facebook/" + crypto.createHash('md5').update(images[i]).digest('hex') + `.png`;
                }
                
                
// 				
			}
		}
		await browser.close();
        return result;
	} catch (err) {
		console.log(err);
	}
}

run();
