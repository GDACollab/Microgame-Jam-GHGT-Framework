var gamesList = [
    "GimmeFive"
];

function loadGame(){
    let gameToLoad = gamesList[Math.floor(Math.random() * gamesList.length)];
    let gameURL = "./games/" + gameToLoad + "/index.html";
    document.getElementById("game").src = gameURL;
    document.getElementById("game").setAttribute("hidden", "");
    if (PicoInterface.isPicoRunning()){
        var picoInterface = new PicoInterface();
        picoInterface.interfaceWithPico();
    }
}