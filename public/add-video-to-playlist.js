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

function wait(time)
{
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), time);
    });
}

async function start()
{
    console.log("Start");

    await waitForElement(() => window['$']);

    console.log("JQuery loaded");

    await waitForElement(() => $("button[aria-label='Mais ações']")[1]);

    console.log(`Clicking on: Mais ações`);

    $("button[aria-label='Mais ações']")[1].click();

    console.log(`Waiting for Mais ações tab to open`);

    await waitForElement(() => $("tp-yt-paper-listbox#items")[0]);

    console.log(`Clicking on: Salvar`);

    $("yt-formatted-string:contains('Salvar')").click();

    console.log(`Waiting for yt playlist renderer...`);

    await waitForElement(() => $("ytd-add-to-playlist-renderer")[0]);

    await wait(1500);

    var checkBox = $($("ytd-add-to-playlist-renderer")[0]).find("tp-yt-paper-checkbox:contains('Test')");
    var checked = checkBox[0].children[0].children[0].className.includes("checked");

    if(checked)
    {
        console.log(`Already added to playlist!`);
        resolveExternalScript(false);

        return;
    } else {
        console.log(`Adding to playlist...`);

        $($("ytd-add-to-playlist-renderer")[0]).find("tp-yt-paper-checkbox:contains('Test')").click();
    }

    await wait(500);

    
    resolveExternalScript(true);
    
    /*
    console.log(`Closing...`);

    $($("ytd-add-to-playlist-renderer")[0]).find("#close-button").click();

    await wait(500);
    */

    console.log(`Done!`);
}

start();