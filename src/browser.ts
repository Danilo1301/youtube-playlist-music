//import puppeteer from 'puppeteer';
import fs from 'fs';

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
//const AnonymizeUAPlugin = require("puppeteer-extra-plugin-anonymize-ua");
//const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const path = require("path");

puppeteer.use(StealthPlugin());
//puppeteer.use(AnonymizeUAPlugin());
/*
puppeteer.use(
    AdblockerPlugin({
    blockTrackers: true,
    })
);
*/

export default class Browser {
    public static browser: any;

    public static async initialize(headless?: boolean)
    {
        headless = headless === true;

        console.log(`Init browser (headless=${headless})`);

        const puppeteer_options = {
            ignoreDefaultArgs: ["--disable-extensions"],
            args: [
                "--start-maximized",
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
            /*
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // <- this one doesn't works in Windows
                '--disable-gpu',
                
            ],
            */
            headless: headless,
            userDataDir: "./userData"
        }

        this.browser = await puppeteer.launch(puppeteer_options);
    }

    public static async injectJQuery(page: any)
    {
        this.injectScript(page, "https://code.jquery.com/jquery-3.2.1.min.js");
    }

    public static async injectScript(page: any, url: string)
    {
        await page.addScriptTag({url: url})
    }

    public static async getPage(n: number)
    {
        const browser = Browser.browser;
        return (await browser.pages())[n];
    }
}