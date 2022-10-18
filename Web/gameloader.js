// Pick a game to repeatedly test. Set "sequential" to go through all the games in order:
const DEBUG_TEST = "";

var debug_index = 0;

const CONFIG_FILE = "./games/config.txt";
// Add games to be loaded here (CONFIG_FILE adds stuff automatically):
var gamesList = {};

fetch(CONFIG_FILE).then(function(response){
    response.text().then(function(text){
        var games = text.replaceAll('\r', '');
        games = games.split('\n');
        games.forEach(function(game){
            var url = game.split("/");
            gamesList[url[0]] = url[1];
        });
    });
});

function loadGame(){
    let gameToLoad = Object.keys(gamesList)[Math.floor(Math.random() * Object.keys(gamesList).length)];
    if (DEBUG_TEST !== "") {
        if (DEBUG_TEST === "sequential"){
            gameToLoad = Object.keys(gamesList)[debug_index];
            debug_index++;
        } else {
            gameToLoad = DEBUG_TEST;
        }
        
        console.log("DEBUG TESTING: " + gameToLoad + " - " + gamesList[gameToLoad]);
    }
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