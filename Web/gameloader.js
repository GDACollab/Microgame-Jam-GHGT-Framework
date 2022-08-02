// Add games to be loaded here:
var gamesList = {
    //"GimmeFive": "index.html",
    "Pico8 MGG22 Test": "mgg_test.html"
};

function loadGame(){
    let gameToLoad = Object.keys(gamesList)[Math.floor(Math.random() * Object.keys(gamesList).length)];
    let gameURL = "./games/" + gameToLoad + "/" + gamesList[gameToLoad];
    document.getElementById("game").src = gameURL;
    document.getElementById("game").setAttribute("hidden", "");
}

function iframeLoaded(){
    if (PicoInterface.isPicoRunning()){
        var picoInterface = new PicoInterface();
        picoInterface.interfaceWithPico();
    }
}