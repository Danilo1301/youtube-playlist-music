import Browser from "./browser";
import Server from './server';
import fs from 'fs';
import request from 'request';

import { Video } from "./video"; 

async function sleep(ms: number) { return new Promise<void>((resolve) => { setTimeout(() => { resolve() }, ms) }); }

function downloadImage(uri, filename, callback)
{
    request.head(uri, function(err, res, body){
      //console.log('content-type:', res.headers['content-type']);
      //console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

interface IBotConfig {
    channelUrl: string
}

interface ScrapVideo {
    watched: boolean
    href: string
    id: string
    title: string
}

export default class Bot {
    public static DATA_DIR = "./data/";
    public static CONFIG_DIR = "./config.json";
    public static LOG_DIR = "./log.txt";

    public Videos: Map<string, Video> = new Map();

    public config: IBotConfig = {
        channelUrl: ""
    }

    public static log(message: string)
    {
        if(!fs.existsSync(Bot.LOG_DIR)) {
            fs.writeFileSync(Bot.LOG_DIR, "");
        }

        let date = new Date()
        const offset = date.getTimezoneOffset()
        date = new Date(date.getTime() - (offset*60*1000))
        const s = date.toISOString().split('T');
        const timeStr = `${s[0]} ${s[1].split(".")[0]}`;
        
        const logMessage = `[${timeStr}] ${message}`;

        fs.appendFileSync(Bot.LOG_DIR, logMessage + "\n");
        console.log(logMessage);
    }

    public async start()
    {
        Bot.log("Bot started...");

        if(!fs.existsSync(Bot.DATA_DIR)) {
            fs.mkdirSync(Bot.DATA_DIR);
        }

        await this.loadConfig();
        
        this.loadData();

        await Server.initialize();

        this.setupExpress();

        await Browser.initialize();

        await this.findVideosInChannel();

        this.saveData();

        const videos = Array.from(this.Videos.values());
        const unwatchedVideos = videos.filter(video => !video.watched);

        for(const video of unwatchedVideos)
        {
            if(video.watched) continue;

            const index = unwatchedVideos.indexOf(video);
            
            console.log(video)
            console.log(`Processing video ${index + 1} / ${unwatchedVideos.length}`)
            
            const browser = Browser.browser;
            const page = (await browser.pages())[0];

            await page.goto(video.href);
            await Browser.injectJQuery(page);

            const addedToPlaylist: boolean = await page.evaluate(() => {
                var el = document.createElement("script");
                el.src = 'http://localhost:3000/add-video-to-playlist.js';
                document.body.append(el);
    
                return new Promise<any>((resolve) => {
                    window["resolveExternalScript"] = (d) => resolve(d);
                })
            });
    
            console.log('addedToPlaylist', addedToPlaylist);
        }

        Bot.log("Bot stopped!");
    }

    public loadData()
    {
        if(!fs.existsSync(Bot.DATA_DIR)) {
            fs.mkdirSync(Bot.DATA_DIR);
        }

        const videos: Video[] = JSON.parse(fs.readFileSync(Bot.DATA_DIR + `/videos.json`, 'utf-8'));
        
        for(const video of videos)
        {
            this.Videos.set(video.id, video);
        }
    }

    public saveData()
    {
        if(!fs.existsSync(Bot.DATA_DIR)) {
            fs.mkdirSync(Bot.DATA_DIR);
        }

        const videos = Array.from(this.Videos.values());

        fs.writeFileSync(Bot.DATA_DIR + `/videos.json`, JSON.stringify(videos));
    }

    private async findVideosInChannel()
    {
        let url = this.config.channelUrl;
        if(!url.includes("/videos")) url += "/videos";
        let channelId = url.split("youtube.com/")[1].replace("/videos", "");

        console.log(`Going to channel ${url} (ID: ${channelId})`);
        Bot.log(`Going to channel: ${channelId}`);

        const browser = Browser.browser;
        const page = (await browser.pages())[0];

        await page.goto(url);
        await Browser.injectJQuery(page);

        const data: ScrapVideo[] = await page.evaluate(() => {
            var el = document.createElement("script");
            el.src = 'http://localhost:3000/create-button.js';
            document.body.append(el);

            return new Promise<any>((resolve) => {
                window["resolveExternalScript"] = (d) => resolve(d);
            })
        });

        console.log(data);

        for(const scrappedVideo of data)
        {
            if(!this.Videos.has(scrappedVideo.id))
            {
                const video: Video = {
                    watched: scrappedVideo.watched,
                    href: scrappedVideo.href,
                    id: scrappedVideo.id,
                    channelId: channelId,
                    title: scrappedVideo.title
                }

                this.Videos.set(video.id, video);

                //console.log(`Found new video ${video.id} (${video.watched ? "Watched" : "Not watched"})`);

                Bot.log(`Found new video ${video.id} '${video.title}' (${video.watched ? "Watched" : "Not watched"})`);
            }

            const video = this.Videos.get(scrappedVideo.id);

            if(video.watched != scrappedVideo.watched && scrappedVideo.watched)
            {
                video.watched = true;
                //console.log(`Video was not watched, but now it is`);

                Bot.log(`Video ${video.id} '${video.title}' is now set to watched`);
            }
        }
    }

    private setupExpress()
    {
        Server.app.get("/", (req, res) => {
            res.end("ok nice");
        })
    }

    private async loadConfig()
    {
        if(!fs.existsSync(Bot.CONFIG_DIR)) return;
        this.config = JSON.parse(fs.readFileSync(Bot.CONFIG_DIR, 'utf-8'));
    }
}