// Pick a game to repeatedly test. Set "sequential" to go through all the games in order:
const DEBUG_TEST = "";

var debug_index = 0;
var gamesList = {};
var gamesConfig = {};
var enabledGames = new Set();
var currGame;

function initGameLoader(){
    // Add games to be loaded here (CONFIG_FILE adds stuff automatically):
    gamesList = ini["Games"];
    gamesConfig = ini["GamesConfig"];
    gameNames = ini["GameNames"];

    // Since each item in GamesConfig is a list of games:
    for (var key in gamesConfig) {
        gamesConfig[key] = gamesConfig[key].split(",");
    }

    var gamesSelect = document.getElementById("options-select-games");
    Object.keys(gameNames).forEach((game) => {
        var p = document.createElement("p");
        enabledGames.add(game);
        var check = document.createElement("input");
        var gameName = gameNames[game];
        check.type = "checkbox";
        check.id = game + "enable";
        check.checked = true;
        check.name = game + "enable";
        var label = document.createElement("label");
        label.innerText = gameName;
        label.htmlFor = game + "enable";
        p.appendChild(check);
        p.appendChild(label);
        gamesSelect.appendChild(p);
    });
}

function getGameToLoad(){
    var gameToLoad = Object.keys(gamesList)[Math.floor(Math.random() * Object.keys(gamesList).length)]
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
    return gameToLoad;
}

function loadGame(gameToLoad){
    let gameURL = "./jam-version-assets/games/" + gameToLoad + "/" + gamesList[gameToLoad];
    document.getElementById("game").src = gameURL;
    currGame = gameToLoad;
}

function iframeLoaded(){
    // Click on the iframe so inputs get through:
    document.getElementById("game").contentWindow.dispatchEvent(new MouseEvent("click"));
    document.getElementById("game").contentWindow.focus();

    // For Unity Exports specifically (minimal Unity HTML templates work good enough, except for when it adds margin):
    document.getElementById("game").contentDocument.body.style.margin = "0";
    if (PicoInterface.isPicoRunning()){
        var picoInterface = new PicoInterface();
        picoInterface.interfaceWithPico();
    }
}