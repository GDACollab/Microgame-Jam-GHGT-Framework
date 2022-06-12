function startMicrogames(){
    GameInterface.init(gameStarted,
        () => {transition(true);}, () => {transition(false);});
    document.getElementById("menu").setAttribute("hidden", "");
    document.getElementById("transitionContainer").removeAttribute("hidden");
    loadGame();
}

function gameStarted(){
    document.getElementById("transitionContainer").setAttribute("hidden", "");
    document.getElementById("game").removeAttribute("hidden");
}

function transition(didWin){
    document.getElementById("transitionContainer").removeAttribute("hidden");
    loadGame();
}