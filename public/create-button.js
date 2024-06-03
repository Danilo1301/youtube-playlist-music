function waitForElement(fn)
{
    return new Promise((resolve, reject) => {
        let element = fn();

        if(element) {
            resolve(element);
            return;
        }

        var interval = setInterval(() => {
            element = fn();

            if(element) {
                clearInterval(interval);
                resolve(element);
            }
        }, 100);
    });
}

function createButton()
{
    var element = document.createElement("div");
    element.style.position = "fixed";
    element.style.left = "0px";
    element.style.top = "0px";
    element.style.zIndex = "10000000";

    var btn = document.createElement("button");
    btn.onclick = () => buttonClicked();
    btn.textContent = "Add videos";

    element.append(btn);

    console.log("append to", $("[id=tabs-container]"));

    //$("[id=tabs-container]").append(element);
    document.body.append(element);
}

function buttonClicked()
{
    console.log("Button clicked");

    getVideos();
}

function getVideos()
{
    console.log("get videos");

    const contents = $("[id=contents]")[0];
    const videos = $(contents).find("[id=content]");

    console.log("videos", videos);

    const scrappedVideos = [];

    for(const video of videos)
    {
        console.log(`Video:`, video);

        const watched = $(video).find("#overlays")[0].children[0].tagName.includes("RESUME");
        const href = $(video).find("a#thumbnail")[0].href;
        const id = href.split("?v=")[1];
        const title = $(video).find("#video-title")[0].textContent;

        const videoData = {
            watched: watched,
            href: href,
            id: id,
            title: title
        }

        scrappedVideos.push(videoData);

        console.log(videoData);
    }

    console.log("Resolving script");

    resolveExternalScript(scrappedVideos);

    /*
    for (const video of videos) {
        const id = video.$["thumbnail"].children[0].href.split("?v=")[1].split("&")[0]
    
        console.log(video.$["thumbnail"])

        const videoData = {
            id: id,
            title: $(video).find("#video-title")[0].title,
            channelName: $(video).find(".ytd-channel-name a")[0].textContent,
            channelUrl: $(video).find(".ytd-channel-name a")[0].href,
            count: 1
        }
    
        jsonData.push(videoData);
    }
    */
}

async function start()
{
    console.log("Start");

    await waitForElement(() => window['$']);

    console.log("JQuery loaded");
    
    console.log("Creating button...");

    createButton();
}

start();






/*
video.$["thumbnail"].children[0].children[0].children[0].src    
*/