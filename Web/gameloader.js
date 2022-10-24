// Pick a game to repeatedly test. Set "sequential" to go through all the games in order:
const DEBUG_TEST = "";

var debug_index = 0;
var gamesList = {};

function initGameLoader(){
    // Add games to be loaded here (CONFIG_FILE adds stuff automatically):
    gamesList = ini["Games"];
}

function loadGame(){
    let gameToLoad = Object.keys(gamesList)[Math.floor(Math.random() * Object.keys(gamesList).length)];
    if (DEBUG_TEST !== "") {
        if (DEBUG_TEST === "sequential"){
            document.body.onkeyup = function(event){
                if (event.key === "1") {
                    debug_index++;
                    transition(true, function(){});
                }
            }
            gameToLoad = Object.keys(gamesList)[debug_index];
            debug_index++;
            if (debug_index > Object.keys(gamesList).length) {
                debug_index = 0;
            }
        } else {
            gameToLoad = DEBUG_TEST;
        }
        
        console.log("DEBUG TESTING: " + gameToLoad + " - " + gamesList[gameToLoad]);
    }
    let gameURL = "./jam-version-assets/games/" + gameToLoad + "/" + gamesList[gameToLoad];
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