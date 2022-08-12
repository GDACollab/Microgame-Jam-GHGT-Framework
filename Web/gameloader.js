// Add games to be loaded here:
var gamesList = {
    "GimmeFive": "index.html",
    "Pico8 MGG22 Test": "mgg_test.html"
};

// TODO: Make game picking more robust, add difficulty increases, etc.
function loadGame(){
    let gameToLoad = Object.keys(gamesList)[Math.floor(Math.random() * Object.keys(gamesList).length)];
    let gameURL = "./games/" + gameToLoad + "/" + gamesList[gameToLoad];
    document.getElementById("game").src = gameURL;
}

function iframeLoaded(){
    // Focus the iframe so inputs get through:
    document.getElementById("game").contentWindow.focus();

    // For Unity Exports specifically (minimal Unity HTML templates work good enough, except for when it adds margin):
    document.getElementById("game").contentDocument.body.style.margin = "0";
    if (PicoInterface.isPicoRunning()){
        var picoInterface = new PicoInterface();
        picoInterface.interfaceWithPico();
    }
}